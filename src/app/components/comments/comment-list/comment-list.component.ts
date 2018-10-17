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
  @Input() parentKey: string;
  @Input() userInfo: UserInfoOpen

  comments$: Observable<Observable<AngularFireAction<DatabaseSnapshot<{}>>>[]>;
  comments;
  keyOfCommentBeingEdited: string;
  constructor(private commentSvc: CommentService) {
  }

  ngOnInit() {
    this.comments$ = this.commentSvc.watchComments(this.parentKey);
    this.fillCommentArray();

  }

  onEditComment(comment) {
    console.log(comment.key);

    this.keyOfCommentBeingEdited = comment.key;
  }

  fillCommentArray() {
    this.comments$.subscribe(comments => {
      const commentArray = [];
      for (let comment$ of comments) {
        comment$.subscribe(comment => {
          commentArray.push(comment);
        });
      }
      this.comments = commentArray;
    });
  }


  commentIsBeingEdited(comment) {
    return this.keyOfCommentBeingEdited === comment.key;
  }
}
