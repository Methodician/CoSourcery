import { Component, OnInit, Input } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';

@Component({
  selector: 'cos-article-preview-card',
  templateUrl: './article-preview-card.component.html',
  styleUrls: ['./article-preview-card.component.scss']
})

export class ArticlePreviewCardComponent implements OnInit {
  @Input() articleData: ArticleDetailFirestore;
  @Input() userId: string;
  isArticleBookmarked: boolean;
  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService
  ) { }

  ngOnInit() {
    if (this.userId) {
      this.checkIfBookmarked();
    }
  }

  navigateToArticleDetail() {
    this.articleSvc.navigateToArticleDetail(this.articleData.articleId);
  }

  async checkIfBookmarked() {
    this.isArticleBookmarked = await this.articleSvc.isBookmarked(this.userId, this.articleData.articleId);
  }

  bookmarkToggle() {
    if (this.authSvc.isSignedIn()) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.userId, this.articleData.articleId);
        this.isArticleBookmarked = false;
      } else {
        this.articleSvc.bookmarkArticle(this.userId, this.articleData.articleId);
        this.isArticleBookmarked = true;
      }
    }
  }

}
