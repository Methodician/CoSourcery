import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: [
    './article-edit.component.scss', '../article-post/article-post.component.scss']
})

export class ArticleEditComponent implements OnInit {
  article: any;
  articleKey: string;
  routeParams: any;
  authInfo = null;
  userInfo = null;

  constructor(
    private articleSvc: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    authSvc: AuthService,
    userSvc: UserService,
  ) {
    authSvc.authInfo$.subscribe(info => {
      this.authInfo = info;
    });
    userSvc.userInfo$.subscribe(user => {
      this.userInfo = user;
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.params.subscribe(params => {
      this.articleKey = params['key'];
      console.log('AE ArtKey 42', this.articleKey);

      this.articleSvc
      .getArticleById(this.articleKey).then((articleToEdit: ArticleDetailFirestore) => {
        console.log('ArtToEdt ', articleToEdit);
        console.log('ArtToEdt.bdID ', articleToEdit.bodyId);
        this.articleSvc
        .getArticleBody(articleToEdit.bodyId)
        .then(articleBody => {
          console.log('artBdy', articleBody);

          if (articleBody) {
            articleToEdit.body = articleBody.body;
                  this.article = articleToEdit;
                  console.log(this.article);

          }
        });
      });
    });
}

  async edit(article) {
    try {
      const res = this.articleSvc.updateArticle(this.authInfo.$uid, this.userInfo, article, this.articleKey);
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
