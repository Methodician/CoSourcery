import { Component, Input } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { Comment } from 'app/shared/class/comment';

@Component({
  selector: 'cos-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() comment: Comment;
  @Input() loggedInUser: UserInfoOpen;
  @Input() authorInfo: UserInfoOpen;
  @Input() isBeingEdited = false;

  constructor(
  ) { }



}
