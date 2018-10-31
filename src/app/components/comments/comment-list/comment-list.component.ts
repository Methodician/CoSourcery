import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService } from 'app/services/comment.service';
import { Subscription } from 'rxjs';
import { UserInfoOpen, UserMap } from 'app/shared/class/user-info';
import { Comment, CommentMap, ParentTypes, KeyMap, VoteDirections } from 'app/shared/class/comment';

@Component({
  selector: 'cos-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() isUnderComment = true;
  @Input() parentKey: string;
  @Input() loggedInUser: UserInfoOpen
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
    private router: Router,
    private commentSvc: CommentService
  ) { }

  ngOnInit() {
    this.fillDataMaps();
  }

  ngOnDestroy() {
    this.commentsSubscription.unsubscribe();
  }

  onUpvoteComment(commentKey: string){
    this.commentSvc.upvoteComment(this.loggedInUser.uid, commentKey, VoteDirections.up);
  }

  onDownvoteComment(commentKey: string){
    this.commentSvc.downvoteComment(this.loggedInUser.uid, commentKey, VoteDirections.down);
  }

  hasUserVoted(commentKey: string, voteDirection: VoteDirections){
    if(!this.userVotesMap[commentKey]){
      return false
    }
    return this.userVotesMap[commentKey] as number === VoteDirections[voteDirection] as any as number;
  }

  enterEditMode(commentKey: string) {
    this.commentReplyInfo.replyParentKey = null;
    this.commentEditInfo.commentKey = commentKey;
  }

  enterNewCommentMode(replyParentKey) {
    this.commentEditInfo.commentKey = null;
    this.commentListUnfurlMap[replyParentKey] = true
    this.newCommentStub = this.commentSvc.createCommentStub(this.loggedInUser.uid, replyParentKey, ParentTypes.comment);
    this.commentReplyInfo.replyParentKey = replyParentKey;
  }

  commentAuthCheck() {
    if (this.loggedInUser.uid) {
      return true;
    } else {
      if (confirm("Login Required: Would you like to login now?")) {
        this.router.navigate(['/login']);
      }
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
    this.commentsSubscription = this.commentSvc.watchCommentsByParent(this.parentKey)
      .subscribe(comments => {
        for (let comment$ of comments) {
          comment$.subscribe(async commentSnap => {
            const val = commentSnap.payload.val() as any;
            const comment = new Comment(val.authorId, val.parentKey, val.text, val.lastUpdated, val.timestamp, val.replyCount, val.parentType, val.voteCount);
            this.commentMap[commentSnap.key] = comment;
            this.commentKeys = Object.keys(this.commentMap);
            if(!!!this.userMap[val.authorId]){
              const authorSnap = await this.getAuthorSnapshot(val.authorId);
              if(authorSnap){
                const authorVal = authorSnap.val();
                const author = new UserInfoOpen(authorVal.alias, authorVal.fName, authorVal.lName, authorSnap.key, authorVal.imageUrl);
                this.userMap[authorSnap.key] = author;
                this.userKeys = Object.keys(this.userMap);
              }
            }
          });
        }
      });
  }

  async getAuthorSnapshot(authorId) {
    const authorInfo = await this.commentSvc.getUserInfo(authorId);
    return authorInfo;
  }

  commentIsBeingEdited(commentKey) {
    return this.commentEditInfo.commentKey === commentKey;
  }

  toggleCommentListUnfurl(key) {
    this.commentListUnfurlMap[key] = this.commentListUnfurlMap[key] ? !this.commentListUnfurlMap[key] : true;
  }

}
