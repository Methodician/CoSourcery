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
  articleCoverImageUrl;
  // We should just be using and @Input() uid: string; instead of using the authSvc for every preview card... User is not needed.
  user;
  isArticleBookmarked: boolean;
  hoverClass: string;
  hoverBg: string;
  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService
  ) { }

  ngOnInit() {
    this.authSvc
      .authInfo$
      .subscribe(user => {
        if (user.uid) {
          this.user = user;
          this.checkIfBookmarked();
        }
      });
      if (this.articleData.imageUrl) {
        this.articleCoverImageUrl = this.articleData.imageUrl;
      }

  }


  navigateToArticleDetail() {
    window.scrollTo(0, 0);
    this.articleSvc.navigateToArticleDetail(this.articleData.articleId);
  }


  navigateToProfile() {
    this.articleSvc.navigateToProfile(this.articleData.authorId);
  }


  async checkIfBookmarked() {
    this.isArticleBookmarked = await this.articleSvc.isBookmarked(this.user.uid, this.articleData.articleId);
  }

  bookmarkToggle() {
        if (this.authSvc.isSignedIn()) {
          if (this.isArticleBookmarked) {
            this.articleSvc.unBookmarkArticle(this.user.uid, this.articleData.articleId);
            this.isArticleBookmarked = false;
          } else {
            this.articleSvc.bookmarkArticle(this.user.uid, this.articleData.articleId);
            this.isArticleBookmarked = true;
          }
        }
      }

  hoverArticleCard() {
    this.hoverClass = this.hoverClass === '' ? 'hover-bg' : '';
    this.hoverBg = this.hoverBg === '' ? 'rgba(0,184,212, 0.15)'   : '';
  }

  exitCard() {
    this.hoverClass = '';
    this.hoverBg = '';
  }

  enterCard() {
    this.hoverClass = 'hover-bg';
    this.hoverBg = 'rgba(0,184,212, 0.15)';
  }

}
