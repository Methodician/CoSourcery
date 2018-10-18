import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';

@Component({
  selector: 'cos-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.scss']
})
export class CommentEditComponent implements OnInit {
  @Input() comment: any;
  @Input() userInfo: UserInfoOpen;
  @Output() textChanges = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  emitText($event) {
    this.textChanges.emit($event.target.value);
  }

}
