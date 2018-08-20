import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  article: any;
  key: any;
  routeParams: any;
  userInfo = null;
  articleValid: boolean;
  subscribeToCurrentArticle: Subscription;


  constructor(
    private articleSvc: ArticleService,
    private route: ActivatedRoute,
    private userSvc: UserService,
  ) {
    this.userSvc.userInfo$.subscribe(user => {
      this.userInfo = user;
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.route.params.subscribe(params => {
      if (params['key']) {
        this.key = params['key'];
        this.articleSvc.setCurrentArticle(this.key);
        this.subscribeToCurrentArticle = this.articleSvc.currentArticle$.subscribe(articleData => {
          if (articleData) {
            this.article = articleData;
            this.articleValid = true;
          }
        });
      }
    });
  }


  async articleEvent(article) {
    if (!article.articleId) {
     const creationCheck = this.articleSvc.createArticle(this.userInfo, article, this.key);
       if (creationCheck === 'success') {
          this.articleValid = true;
       }
    }
      this.articleSvc.updateArticle(this.userInfo, article, this.key);
  }


  // Deletes abortive article creation.
  ngOnDestroy() {
    console.log('this.article', this.article);
    console.log('this.articleValid', this.articleValid);
    console.log('this.key', this.key);
    this.subscribeToCurrentArticle.unsubscribe();
    if (!this.article && !this.articleValid) {
      this.articleSvc.deleteArticleRef(this.key);
    }
  }

}
