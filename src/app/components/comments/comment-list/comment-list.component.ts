import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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

  commentsSubscription: Subscription;
  //  ToDo: FILL THIS WITH OTHER SUBSCRIPTIONS TO BREAK DOWN ON DESTROY
  // commentSubscriptions: Subscription[];

  keyOfCommentBeingEdited: string;
  newCommentStub: Comment;

  commentMap: CommentMap = {};
  commentKeys: string[];
  commentListUnfurlMap: KeyMap<boolean> = {};

  constructor(private commentSvc: CommentService) {
  }

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

  enterEditMode(commentKey: string) {
    this.keyOfCommentBeingEdited = commentKey;
  }

  enterNewCommentMode(replyParentKey) {
    this.newCommentStub = this.commentSvc.createCommentStub(this.loggedInUser.uid, replyParentKey, ParentTypes.comment);
    this.commentReplyInfo.replyParentKey = replyParentKey;
  }

  onCancelNewComment() {
    this.commentReplyInfo.replyParentKey = null;
  }

  onAddComment() {
    this.commentSvc.createComment(this.newCommentStub);
    this.commentReplyInfo.replyParentKey = null;
  }

  onCancelEdit() {
    this.keyOfCommentBeingEdited = null;
  }

  onRemoveComment(commentKey: string) {
    this.commentSvc.removeComment(commentKey);
  }

  onSaveEdits() {
    const commentEdited = this.commentMap[this.keyOfCommentBeingEdited];
    this.commentSvc.updateComment(commentEdited, this.keyOfCommentBeingEdited);
    this.keyOfCommentBeingEdited = null;
  }

  fillDataMaps() {
    this.commentsSubscription = this.commentSvc.watchCommentsByParent(this.parentKey)
      .subscribe(comments => {
        for (let comment$ of comments) {
          comment$.subscribe(async commentSnap => {
            const val = commentSnap.payload.val() as any;
            const comment = new Comment(val.authorId, val.parentKey, val.text, val.lastUpdated, val.timestamp, val.replyCount, val.parentType);
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
    return this.keyOfCommentBeingEdited === commentKey;
  }

  toggleCommentListUnfurl(key) {
    this.commentListUnfurlMap[key] = this.commentListUnfurlMap[key] ? !this.commentListUnfurlMap[key] : true;
  }

}
