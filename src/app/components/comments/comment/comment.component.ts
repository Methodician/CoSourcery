import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';

@Component({
  selector: 'cos-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment: any;
  @Input() userInfo: UserInfoOpen;
  @Input() isBeingEdited = false;
  @Output() textChanges = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  emitText($event) {
    this.textChanges.emit($event.target.value);
  }

}
