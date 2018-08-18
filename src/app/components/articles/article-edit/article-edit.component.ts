import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

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
      if (params) {
        this.key = params['key'];
        this.articleSvc
        .getArticleById(this.key).then(articleToEdit => {
          if (articleToEdit) {
            this.articleValid = true;
            this.article = articleToEdit;
          }
          this.article = articleToEdit;
        });
      }
    });
  }


  async edit(article) {
    console.log(this.userInfo, article, this.key, this.article);
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

    if (!this.article && !this.articleValid) {
      this.articleSvc.deleteArticleRef(this.key);
    }
  }

}
