import { Component, OnInit, Input } from '@angular/core';
import { ArticleDetail } from '@class/article-info';
import { UserInfoOpen } from '@class/user-info';

@Component({
  selector: 'cos-article-version-card',
  templateUrl: './article-version-card.component.html',
  styleUrls: ['./article-version-card.component.scss']
})
export class ArticleVersionCardComponent implements OnInit {

  @Input() article: ArticleDetail;
  @Input() editor: UserInfoOpen;
  @Input() shouldHighlight: boolean;
  @Input() currentVersion: boolean;

  constructor() {
  }

  ngOnInit() {
  }

}
