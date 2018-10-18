import { Component, OnInit, Input } from '@angular/core';
import { CommentService } from 'app/services/comment.service';
import { Observable } from 'rxjs';
import { AngularFireAction, DatabaseSnapshot } from '@angular/fire/database';
import { UserInfoOpen } from 'app/shared/class/user-info';

@Component({
  selector: 'cos-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {
  @Input() isUnderComment = true;
  @Input() parentKey: string;
  @Input() loggedInUser: UserInfoOpen

  comments$: Observable<Observable<AngularFireAction<DatabaseSnapshot<{}>>>[]>;
  comments: AngularFireAction<DatabaseSnapshot<{}>>[];
  keyOfCommentBeingEdited: string;
  textOfCommentEdits: string;
  addingNewComment = false;

  constructor(private commentSvc: CommentService) {
  }

  ngOnInit() {
    this.comments$ = this.commentSvc.watchComments(this.parentKey);
    this.fillCommentArray();
  }

  enterNewCommentMode() {
    this.addingNewComment = true;
  }

  onCancelNewComment() {
    this.addingNewComment = false;
  }

  onAddComment() {
    this.commentSvc.createComment(this.textOfCommentEdits, this.parentKey, this.loggedInUser.uid);
    this.addingNewComment = false;
  }

  enterEditMode(comment: AngularFireAction<DatabaseSnapshot<{}>>) {
    this.keyOfCommentBeingEdited = comment.key;
  }

  onRemoveComment(comment: AngularFireAction<DatabaseSnapshot<{}>>) {
    this.commentSvc.removeComment(comment);
  }

  onCancelEdit() {
    this.keyOfCommentBeingEdited = null;
  }

  onEditText(newText) {
    this.textOfCommentEdits = newText;
  }

  onSaveEdits(comment: AngularFireAction<DatabaseSnapshot<{}>>) {
    this.commentSvc.updateComment(comment, this.textOfCommentEdits);
    this.keyOfCommentBeingEdited = null;
  }

  fillCommentArray() {
    this.comments$.subscribe(comments => {
      const commentsObject = {};
      for (let comment$ of comments) {
        comment$.subscribe(snapshot => {
          // was getting duplicates on edit, so going with objects to prevent it.
          // const existingComment = this.comments.filter((com) => {
          //   return com.key === comment.key;
          // });
          // console.log('the comment will duplicate', existingComment);
          commentsObject[snapshot.key] = snapshot;
          this.comments = Object.values(commentsObject);
        });
      }

    });
  }


  commentIsBeingEdited(comment) {
    return this.keyOfCommentBeingEdited === comment.key;
  }
}
