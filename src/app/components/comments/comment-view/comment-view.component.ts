import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'cos-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrls: ['./comment-view.component.scss']
})
export class CommentViewComponent implements OnInit {
  @Input() comment: any

  constructor() { }

  ngOnInit() {
  }

}
