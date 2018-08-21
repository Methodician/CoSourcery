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
  hoverClass: string;
  hoverBg: string;
  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService
  ) { }

  ngOnInit() {
    if(this.userId){
       this.checkIfBookmarked();
    }
  }


  navigateToArticleDetail() {
    window.scrollTo(0, 0);
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
