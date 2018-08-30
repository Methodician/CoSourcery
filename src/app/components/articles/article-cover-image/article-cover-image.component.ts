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
  @Input() articleId;
  @Input() createNew;
  articleCoverImageUrl;
  artilceImageAlt;
  articleSubscitption: Subscription;
  constructor(private articleSvc: ArticleService, private uploadSvc: UploadService) { }

  ngOnInit() {
    this.subscribeToArticle();
  }

  subscribeToArticle() {
    this.articleSubscitption = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
        this.articleCoverImageUrl = articleData.imageUrl;
        this.artilceImageAlt = articleData.imageAlt;
      }
    });
  }
  ngOnDestroy(): void {
    this.articleSubscitption.unsubscribe();
  }

}
