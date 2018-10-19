import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommentService } from 'app/services/comment.service';
import { Subscription } from 'rxjs';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { Comment } from 'app/shared/class/comment';

@Component({
  selector: 'cos-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() isUnderComment = true;
  @Input() parentKey: string;
  @Input() loggedInUser: UserInfoOpen

  commentsSubscription: Subscription;
  //  FILL THIS WITH OTHER SUBSCRIPTIONS TO BREAK DOWN ON DESTROY
  // commentSubscriptions: Subscription[];

  keyOfCommentBeingEdited: string;
  addingNewComment = false;
  newCommentStub = new Comment();

  commentMap: CommentMap = {};
  commentKeys: string[];

  constructor(private commentSvc: CommentService) {
  }

  ngOnInit() {
    this.fillCommentMap();
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

  fillCommentMap() {
    this.commentsSubscription = this.commentSvc.watchCommentsByParent(this.parentKey)
      .subscribe(comments => {
        for (let comment$ of comments) {
          comment$.subscribe(async commentSnap => {
            console.log('new comment text', (commentSnap.payload.val() as any).text);

            const val = commentSnap.payload.val() as any;
            const authorSnap = await this.getAuthorSnapshot(val.authorId);
            const authorVal = authorSnap.val();
            const author = new UserInfoOpen(authorVal.alias, authorVal.fName, authorVal.lName, authorSnap.key)
            const comment = new Comment(val.authorId, val.parentKey, val.text, author, val.lastUpdated, val.timestamp);
            this.commentMap[commentSnap.key] = comment;
            this.commentKeys = Object.keys(this.commentMap);
          });
        }
      });
  }

  createCommentStub() {
    this.newCommentStub = new Comment(this.loggedInUser.uid, this.parentKey, '', this.loggedInUser);
  }

  async getAuthorSnapshot(authorId) {
    const authorInfo = await this.commentSvc.getUserInfo(authorId);
    return authorInfo;
  }

  commentIsBeingEdited(commentKey) {
    return this.keyOfCommentBeingEdited === commentKey;
  }
}

//  Very cool: https://stackoverflow.com/questions/13315131/enforcing-the-type-of-the-indexed-members-of-a-typescript-object
export interface KeyMap<T> { [key: string]: T; };
export interface CommentMap extends KeyMap<Comment> { };