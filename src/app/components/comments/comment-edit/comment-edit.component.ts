import { Component, OnInit, Input } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';

@Component({
  selector: 'cos-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.scss']
})
export class CommentEditComponent implements OnInit {
  @Input() parentKey: string;
  @Input() userInfo: UserInfoOpen;

  constructor() { }

  ngOnInit() {
  }

}
