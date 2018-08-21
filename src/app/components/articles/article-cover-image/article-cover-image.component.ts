import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { Subscription } from 'rxjs';
import { UploadService } from '../../../services/upload.service';


@Component({
  selector: 'cos-article-cover-image',
  templateUrl: './article-cover-image.component.html',
  styleUrls: ['./article-cover-image.component.scss']
})
export class ArticleCoverImageComponent implements OnInit, OnDestroy {
  @Input() articleKey;
  editing: boolean;
  articleCoverImageUrl;
  artilceImageAlt;
  articleSubscitption: Subscription;
  constructor(private articleSvc: ArticleService, private uploadSvc: UploadService) { }

  ngOnInit() {
    if (this.articleKey) {
      this.subscribeToArticle(this.articleKey);
      // maybe remove this.
      this.editing = true;
    }

  }

  subscribeToArticle(articleKey) {
    this.articleSubscitption =  this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
         this.articleCoverImageUrl = articleData.imageUrl;
         this.artilceImageAlt = articleData.imageAlt;
      }
  });
}
  ngOnDestroy(): void {
    if (this.editing === true) {
      this.articleSubscitption.unsubscribe();
    }

  }

}
