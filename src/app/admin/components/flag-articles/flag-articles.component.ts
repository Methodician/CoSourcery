import { Component, OnInit } from '@angular/core';
import { ArticleService } from '@services/article.service';
import { ArticlePreview } from '@class/article-info';
import { UserService } from '@services/user.service';
import { UserMap } from '@class/user-info';
import { AdminService } from '@admin/services/admin.service';

@Component({
  selector: 'cos-flag-articles',
  templateUrl: './flag-articles.component.html',
  styleUrls: ['./flag-articles.component.scss'],
})
export class FlagArticlesComponent implements OnInit {
  articlePreviews: ArticlePreview[];
  userMap: UserMap;

  constructor(
    private articleSvc: ArticleService,
    private adminSvc: AdminService,
    private userSvc: UserService,
  ) {
    this.userMap = this.userSvc.userMap;
  }

  ngOnInit() {
    this.adminSvc
      .allArticlesRef()
      .valueChanges()
      .subscribe(previews => {
        this.articlePreviews = previews;
      });
  }

  userFromId = uid => {
    if (this.userMap[uid]) {
      return this.userMap[uid];
    }
    this.userSvc.addUserToMap(uid);
  };

  flagArticle = articleId => {
    this.articleSvc.flagArticle(articleId);
  };

  unflagArticle = articleId => {
    this.adminSvc.unflagArticle(articleId);
  };
}
