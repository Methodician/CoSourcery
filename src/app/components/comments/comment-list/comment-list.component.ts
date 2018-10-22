import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommentService } from 'app/services/comment.service';
import { Subscription } from 'rxjs';
import { UserInfoOpen, UserMap } from 'app/shared/class/user-info';
import { Comment, CommentMap } from 'app/shared/class/comment';

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

  commentsSubscription: Subscription;
  //  ToDo: FILL THIS WITH OTHER SUBSCRIPTIONS TO BREAK DOWN ON DESTROY
  // commentSubscriptions: Subscription[];

  keyOfCommentBeingEdited: string;
  addingNewComment = false;
  newCommentStub = new Comment();

  commentMap: CommentMap = {};
  commentKeys: string[];



  constructor(private commentSvc: CommentService) {
  }

  ngOnInit() {
    this.fillDataMaps();
  }

  ngOnDestroy() {
    this.commentsSubscription.unsubscribe();
  }

  enterEditMode(commentKey: string) {
    this.keyOfCommentBeingEdited = commentKey;
  }

  enterNewCommentMode() {
    this.createCommentStub();
    this.addingNewComment = true;
  }

  onCancelNewComment() {
    this.addingNewComment = false;
  }

  onAddComment() {
    this.commentSvc.createComment(this.newCommentStub);
    this.addingNewComment = false;
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
            const comment = new Comment(val.authorId, val.parentKey, val.text, val.lastUpdated, val.timestamp);
            this.commentMap[commentSnap.key] = comment;
            this.commentKeys = Object.keys(this.commentMap);
            if(!!!this.userMap[val.authorId]){
              const authorSnap = await this.getAuthorSnapshot(val.authorId);
              const authorVal = authorSnap.val();
              const author = new UserInfoOpen(authorVal.alias, authorVal.fName, authorVal.lName, authorSnap.key, authorVal.imageUrl);
              this.userMap[authorSnap.key] = author;
              this.userKeys = Object.keys(this.userMap);
            }
          });
        }
      });
  }

  createCommentStub() {
    this.newCommentStub = new Comment(this.loggedInUser.uid, this.parentKey, '');
  }

  async getAuthorSnapshot(authorId) {
    const authorInfo = await this.commentSvc.getUserInfo(authorId);
    return authorInfo;
  }

  commentIsBeingEdited(commentKey) {
    return this.keyOfCommentBeingEdited === commentKey;
  }
}