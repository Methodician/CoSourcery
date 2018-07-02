import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommentService } from '../../../services/comment.service';
import { Router } from '@angular/router';



@Component({
  selector: 'cos-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.scss']
})
export class CommentEditComponent implements OnInit {
  @Input() currentUserInfo;
  @Input() initialCommentValue;
  @Output() cancelClickSender = new EventEmitter();
  @Output() deleteClickSender = new EventEmitter();
  @Output() editFormButtonClickSender = new EventEmitter();



  constructor(private commentSvc: CommentService, private router: Router) { }

  ngOnInit() { }

  tryUpdateComment(commentData) {
    if (this.currentUserInfo) {
      this.updateComment(commentData);
    } else {
      this.router.navigate(['login']);
    }
  }

  updateComment(newCommentData) {
    const comment = {
      text: newCommentData.text,
      key: this.initialCommentValue.$key
    };

    this.commentSvc.updateComment(comment);
  }

  editButtonsClicked(buttonName: string) {
    this.editFormButtonClickSender.emit(buttonName);
  }

  cancelButtonClicked() {
    this.cancelClickSender.emit();
  }

  deleteButtonClicked() {
    this.deleteClickSender.emit();
  }
}

