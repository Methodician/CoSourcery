import { Component, OnInit, Input } from '@angular/core';
import { CommentService } from 'app/services/comment.service';

@Component({
  selector: 'cos-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {
  @Input() parentKey: string;

  comments$;
  comments;

  constructor(private commentSvc: CommentService) {
  }

  ngOnInit() {
    this.comments$ = this.commentSvc.watchComments(this.parentKey);
    // get comments by parent

    this.comments$.subscribe(comments => {
      this.comments = comments;
    });

  }

}
