import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '@services/article.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'cos-article-history',
  templateUrl: './article-history.component.html',
  styleUrls: ['./article-history.component.scss'],
  encapsulation: ViewEncapsulation.None, // needed to allow styles to work in article-body section generated via the [innerHTML]. See https://stackoverflow.com/questions/44210786/style-not-working-for-innerhtml-in-angular-2-typescript
})
export class ArticleHistoryComponent implements OnInit {

  articleId:string = null;
  articleVersion:string = null;
  articleHistory = {};
  articleHistoryKeys = [];
  articleContributorIds: string[];
  
  displayedColumns: string[] = ['title', 'version', 'lastUpdated', 'lastEditorId'];

  constructor(
              private route: ActivatedRoute,
              private articleSvc: ArticleService,
              private userSvc: UserService,
            ) { }

  ngOnInit() {
    this.setArticleId();
    this.getArticleHistory();
  }

  // each times params change check key agains current displayed article key and if not the same, update.
  setArticleId() {
    this.route.params.subscribe(params => {
      if (params['key'] && params['version']) {
        const {key, version} = params;
        this.articleId = key;
        this.articleVersion = version;
      }
    });
  }

  getArticleHistory() {
    this.articleSvc.getArticleHistoryRefById(this.articleId).valueChanges().subscribe(history => {
      // translate returned array into object map with version number for keys and version data for values
      history.map(article => {
        this.articleHistory[article.version] = article;
      });
      
      // create array of version numbers and sort them starting with the latest version
      this.articleHistoryKeys = Object.keys(this.articleHistory);
      this.articleHistoryKeys.sort((key1, key2) => this.articleHistory[key1].version < this.articleHistory[key2].version ? 1 : -1)

      // create array of contributor IDs and add them to the userMap in the UserService if they're not already there.
      this.articleContributorIds = Object.keys(this.articleHistory[this.articleHistoryKeys[0]].editors)
      this.articleContributorIds.map(id => {
        if (!this.userSvc.userMap[id]) {
          this.userSvc.addUserToMap(id); 
        };
      });
      
      console.log(this.articleHistory[this.articleVersion].body)
    });
  }
}
