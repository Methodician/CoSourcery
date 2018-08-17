import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { Subscription } from '../../../../../node_modules/rxjs';
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
  coverImageSub: Subscription;
  imageAltSub: Subscription;
  constructor(private articleSvc: ArticleService, private uploadSvc: UploadService) { }

  ngOnInit() {
    if (this.articleKey) {
      this.subscribeToArticle(this.articleKey);
      // think this is an artifact from previous
      // approach. Will test on next pass.
      this.editing = true;
    }

  }

  subscribeToArticle(articleKey) {
    this.articleSvc.setCurrentArticle(articleKey);
    this.coverImageSub =  this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
         this.articleCoverImageUrl = articleData.imageUrl;
      }

    });
    this.imageAltSub = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
        this.artilceImageAlt = articleData.imageAlt;
      }
    });
  }
  ngOnDestroy(): void {
    if (this.editing === true) {
      this.imageAltSub.unsubscribe();
      this.coverImageSub.unsubscribe();
    }

  }

}
