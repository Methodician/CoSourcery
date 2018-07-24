import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss',
  // '../article-post.component.scss'
]
})

export class ArticleEditComponent implements OnInit {
  article: any;
  key: any;
  routeParams: any;
  authInfo = null;
  userInfo = null;

  constructor(
    private articleSvc: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private authSvc: AuthService,
    private userSvc: UserService,
  ) {
    this.authSvc.authInfo$.subscribe(info => {
      this.authInfo = info;
    });
    userSvc.userInfo$.subscribe(user => {
      this.userInfo = user;
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      this.key = params['key'];
      this.articleSvc
      .getArticleById(this.key).then((articleToEdit: ArticleDetailFirestore) => {
        this.articleSvc
        .getArticleBody(articleToEdit.bodyId)
        .then(articleBody => {
          if (articleBody) {
            articleToEdit.body = articleBody.body;
                  this.article = articleToEdit;
          }
        });
      });
    });
}

  async edit(article) {
    try {
      const res = this.articleSvc.updateArticle(this.authInfo.uid, this.userInfo, article, this.key);
      if (res) {
        this.router.navigate([`articledetail/${article.articleId}`]);
      } else {
        // "res" should be null-or-undefined, maybe need different message?
        alert('trouble editing the article' + res);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
