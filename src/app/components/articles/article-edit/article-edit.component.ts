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
  articleId: any;
  routeParams: any;
  userInfo = null;
  articleValid: boolean;
  articleNew: boolean;
  currentArticleSubscription: Subscription;


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
        this.articleId = params['key'];
        this.articleValid = true;
        this.articleNew = false;
      } else {
        this.articleId = this.articleSvc.newArticleId$;
        if (!this.articleId) {
          this.articleId = this.articleSvc.createArticleId();
          console.log(this.articleId);
        }
        this.articleValid = false;
        this.articleNew = true;
      }
    });
    this.articleSvc.setCurrentArticle(this.articleId);
    this.currentArticleSubscription = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
        this.article = articleData;
      }
    });

    window.onbeforeunload = () => {
      this.currentArticleSubscription.unsubscribe();
      if (!this.articleValid) {
        this.articleSvc.deleteArticleRef(this.articleId);
      }
    };

  }


  async articleEvent(article) {
    if (!article.articleId) {
      const creationCheck = await this.articleSvc.createArticle(this.userInfo, article, this.articleId);
      if (creationCheck === 'success') {
        this.articleValid = true;
      }
    }
    this.articleSvc.updateArticle(this.userInfo, article, this.articleId);
  }


  // Deletes abortive article creation.
  ngOnDestroy() {
    this.currentArticleSubscription.unsubscribe();
    if (!this.articleValid) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
  }

}
