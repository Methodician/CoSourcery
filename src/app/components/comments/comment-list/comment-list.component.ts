import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommentService } from '@services/comment.service';
import { Subscription } from 'rxjs';
import { UserInfoOpen, UserMap } from '@class/user-info';
import { Comment, CommentMap, ParentTypes, KeyMap, VoteDirections } from '@class/comment';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '@modals/login-dialog/login-dialog.component';

@Component({
  selector: 'cos-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() isUnderComment = true;
  @Input() parentKey: string;
  @Input() loggedInUser: UserInfoOpen;
  @Input() userMap: UserMap = {};
  @Input() userKeys: string[];
  @Input() userVotesMap: KeyMap<VoteDirections>;
  @Input() commentReplyInfo;
  @Input() commentEditInfo;

  commentsSubscription: Subscription;
  //  ToDo: FILL THIS WITH OTHER SUBSCRIPTIONS TO BREAK DOWN ON DESTROY
  // commentSubscriptions: Subscription[];

  newCommentStub: Comment;

  commentMap: CommentMap = {};
  commentKeys: string[];
  commentListUnfurlMap: KeyMap<boolean> = {};

  constructor(
    private commentSvc: CommentService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.fillDataMaps();
  }

  ngOnDestroy() {
    this.commentsSubscription.unsubscribe();
  }

  onUpvoteComment(commentKey: string) {
    this.commentSvc.upvoteComment(this.loggedInUser.uid, commentKey, VoteDirections.up);
  }

  onDownvoteComment(commentKey: string) {
    this.commentSvc.downvoteComment(this.loggedInUser.uid, commentKey, VoteDirections.down);
  }

  hasUserVoted(commentKey: string, voteDirection: VoteDirections) {
    if (!this.userVotesMap[commentKey]) {
      return false;
    }
    return this.userVotesMap[commentKey] as number === VoteDirections[voteDirection] as any as number;
  }

  enterEditMode(commentKey: string) {
    this.commentReplyInfo.replyParentKey = null;
    this.commentEditInfo.commentKey = commentKey;
  }

  enterNewCommentMode(replyParentKey) {
    this.commentEditInfo.commentKey = null;
    this.commentListUnfurlMap[replyParentKey] = true;
    this.newCommentStub = this.commentSvc.createCommentStub(this.loggedInUser.uid, replyParentKey, ParentTypes.comment);
    this.commentReplyInfo.replyParentKey = replyParentKey;
  }

  authCheck() {
    if (this.loggedInUser.uid) {
      return true;
    } else {
      this.dialog.open(LoginDialogComponent);
      return false;
    }
  }

  onCancelNewComment() {
    this.commentReplyInfo.replyParentKey = null;
  }

  onAddComment() {
    this.commentSvc.createComment(this.newCommentStub);
    this.commentReplyInfo.replyParentKey = null;
  }

  onCancelEdit() {
    this.commentEditInfo.commentKey = null;
  }

  onRemoveComment(commentKey: string) {
    this.commentSvc.removeComment(commentKey);
  }

  onSaveEdits() {
    const commentEdited = this.commentMap[this.commentEditInfo.commentKey];
    this.commentSvc.updateComment(commentEdited, this.commentEditInfo.commentKey);
    this.commentEditInfo.commentKey = null;
  }

  fillDataMaps() {
    // leads to large method call chain - may be candidate for further refactor
    this.commentsSubscription = this.unfurlCommentObservables();
  }

  unfurlCommentObservables(): Subscription {
    return this.commentSvc.watchCommentsByParent(this.parentKey)
      .subscribe(comments => {
        for (const comment$ of comments) {
          comment$.subscribe(commentSnap => {
            this.mapCommentSnapshot(commentSnap);
          });
        }
      });
  }

  mapCommentSnapshot(snapshot: any) {
    const val = snapshot.payload.val() as any;
    const comment = new Comment(val.authorId, val.parentKey, val.text, val.lastUpdated, val.timestamp, val.replyCount, val.parentType, val.voteCount);
    this.commentMap[snapshot.key] = comment;
    this.commentKeys = Object.keys(this.commentMap);
    if (!this.userMap[val.authorId]) {
      this.mapUser(val.authorId);
    }
  }

  async mapUser(userId: string) {
    const authorSnap = await this.commentSvc.getUserInfo(userId);
    if (authorSnap) {
      const authorVal = authorSnap.val();
      const author = new UserInfoOpen(authorVal.alias, authorVal.fName, authorVal.lName, authorSnap.key, authorVal.imageUrl);
      this.userMap[authorSnap.key] = author;
      this.userKeys = Object.keys(this.userMap);
    }
  }

  commentIsBeingEdited(commentKey) {
    return this.commentEditInfo.commentKey === commentKey;
  }

  toggleCommentListUnfurl(key) {
    this.commentListUnfurlMap[key] = this.commentListUnfurlMap[key] ? !this.commentListUnfurlMap[key] : true;
  }

}
