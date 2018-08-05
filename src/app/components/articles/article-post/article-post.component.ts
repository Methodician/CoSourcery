import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'cos-article-post',
  templateUrl: './article-post.component.html',
  styleUrls: ['./article-post.component.scss']
})
export class ArticlePostComponent implements OnInit {
authInfo;
userInfo;
article;

  constructor(
    private articleSvc: ArticleService,
    private router: Router,
    private authSvc: AuthService,
    private userSvc: UserService,
  )  {
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo.uid)
        this.authInfo = authInfo;
    });
    this.userSvc.userInfo$.subscribe(userInfo => {
      if (userInfo.fName)
        this.userInfo = userInfo;
    });
  }

  ngOnInit() {
  }

  async save(article) {
   this.articleSvc.createArticle(this.userInfo.uid, this.userInfo, article);
  }

}
