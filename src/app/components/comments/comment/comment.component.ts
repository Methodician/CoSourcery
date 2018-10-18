import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { Comment } from 'app/shared/class/comment';
import { CommentService } from 'app/services/comment.service';

@Component({
  selector: 'cos-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges {
  @Input() commentSnapshot: any;
  @Input() loggedInUser: UserInfoOpen;
  @Input() authorInfo: UserInfoOpen;
  @Input() isBeingEdited = false;
  @Output() textChanges = new EventEmitter();

  comment = new Comment();

  constructor(
    //  I'd prefer not to have the service here but having trouble populating author info
    private commentSvc: CommentService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if (changes['commentSnapshot'] && changes['commentSnapshot'].currentValue) {
      this.comment = changes['commentSnapshot'].currentValue.payload.val();
      if (!this.authorInfo) {
        this.getAuthorInfo(this.comment.authorId);
      }
    }

  }

  emitText($event) {
    this.textChanges.emit($event.target.value);
  }


  async getAuthorInfo(authorId) {
    const authorInfoSnap = await this.commentSvc.getUserInfo(authorId);
    const authorVal = authorInfoSnap.val();
    console.log(authorVal);
    this.authorInfo = new UserInfoOpen(
      authorVal.alias,
      authorVal.fName,
      authorVal.lName,
      authorVal.zipCode,
      authorVal.imageUrl
    );

    console.log(this.authorInfo.displayImageUrl());

  }


}
