import { Component, OnInit, Input } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { ArticleDetailPreview } from 'app/shared/class/article-info';

@Component({
  selector: 'cos-article-preview-card',
  templateUrl: './article-preview-card.component.html',
  styleUrls: ['./article-preview-card.component.scss']
})

export class ArticlePreviewCardComponent implements OnInit {
  @Input() articleData: ArticleDetailPreview;
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
    // console.log(this.articleData);
    // console.log(this.articleData.articleId);
  }

  async checkIfBookmarked() {
    const ref = await this.articleSvc.bookmarkedRef(this.userId, this.articleData.articleId);
    ref.valueChanges().subscribe(snapshot => {
      if (snapshot && snapshot.toString().length === 13) {
        this.isArticleBookmarked = true;
      } else {
        this.isArticleBookmarked = false;
      }
    });
  }

  bookmarkToggle() {
    if (this.authSvc.isSignedIn()) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.userId, this.articleData.articleId);
      } else {
        this.articleSvc.bookmarkArticle(this.userId, this.articleData.articleId);
      }
    }
  }

}
