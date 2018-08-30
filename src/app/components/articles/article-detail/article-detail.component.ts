import { AuthService } from '../../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { UserInfoOpen } from 'app/shared/class/user-info';

import * as smoothscroll from 'smoothscroll-polyfill';
import { Subscription } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'cos-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  articleKey: string;
  isArticleBookmarked: boolean;
  author;
  article;
  articleSubscription: Subscription;
  user: UserInfoOpen = null;


  constructor(
    private articleSvc: ArticleService,
    private userSvc: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private authSvc: AuthService
  ) { smoothscroll.polyfill(); }

  ngOnInit() {
    window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if (params['key']) {
          this.articleKey = params['key'];
          this.articleSvc.setCurrentArticle(this.articleKey);
        }
      });
      this.articleSubscription = this.articleSvc.currentArticle$.subscribe(articleData => {
        this.article = articleData;
        this.getAuthor(articleData.authorId);
      });
    this.userSvc.userInfo$.subscribe((user: UserInfoOpen) => {
      if (user.exists()) {
        this.user = user;
        this.checkIfBookmarked();
      }
    });
  }


  navigateToProfile() {
    this.articleSvc.navigateToProfile(this.author.uid);
  }

  async checkIfBookmarked() {
    const isBookmarked = await this.articleSvc.isBookmarked(this.user.uid, this.articleKey);
    this.isArticleBookmarked = isBookmarked;
  }

  bookmarkToggle() {
    if (this.authSvc.isSignedIn()) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.user.uid, this.article.articleId);
        this.isArticleBookmarked = false;
      } else {
        this.articleSvc.bookmarkArticle(this.user.uid, this.article.articleId);
        this.isArticleBookmarked = true;
      }
    }
  }

  edit() {
    this.router.navigate([`editarticle/${this.articleKey}`]);
  }

  async getAuthor(authorKey: string) {
    const author = await this.articleSvc.getAuthor(authorKey);
    author.uid = authorKey;
    this.author = author;
  }


  ngOnDestroy() {
    this.articleSubscription.unsubscribe();
  }

}


