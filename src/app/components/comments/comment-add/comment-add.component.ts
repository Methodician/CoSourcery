import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommentService } from '../../../services/comment.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'cos-comment-add',
  templateUrl: './comment-add.component.html',
  styleUrls: ['./comment-add.component.scss']
})
export class CommentAddComponent implements OnInit {
  @Input() headerTitle;
  @Input() parentKey;
  @ViewChild('form') commentForm;
  isFormShowing = false;

  currentUserInfo;
  constructor(
    private userSvc: UserService,
    private authSvc: AuthService,
    private commentSvc: CommentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userSvc.userInfo$.subscribe(userInfo => {
      this.currentUserInfo = userInfo;
    });
  }

  postComment(commentData) {
    this.authSvc.authInfo.subscribe(user => {
      if (user.uid) {
        console.log(user.uid);
        this.saveComment(commentData);
      }
    })
  }

  saveComment(commentData) {
    const comment = {
      authorKey: this.currentUserInfo.uid,
      parentKey: this.parentKey,
      parentType: 'article',
      text: commentData.text
    }
    this.commentSvc.saveComment(comment);
    this.toggleCommentForm()
  }

  cancelComment() {
    this.isFormShowing = false;
    this.commentForm.form.reset();
  }

  toggleCommentForm() {
    this.authSvc
      .authInfo
      .subscribe(user => {
        if (user.uid) {
          console.log(user.uid);
          this.isFormShowing = !this.isFormShowing;
        }
      });
  }
}

