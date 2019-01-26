import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '@services/article.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'cos-article-history',
  templateUrl: './article-history.component.html',
  styleUrls: ['./article-history.component.scss'],
  encapsulation: ViewEncapsulation.None, // needed to allow styles to work in article-body section generated via the [innerHTML]. See https://stackoverflow.com/questions/44210786/style-not-working-for-innerhtml-in-angular-2-typescript
})
export class ArticleHistoryComponent implements OnInit {

  articleId: string = null;
  // @MAYT: Since it turns out we're doing lots of basic math with articleVersion, let's store it as a number.
  articleVersion: number = null;
  articleHistory = {};
  articleHistoryKeys = [];
  articleContributorIds: string[];

  // History Navigation Logic
  paused = true;
  historyTicker = null;
  
  displayedColumns: string[] = ['version', 'date', 'lastEditorId'];

  constructor(
              private route: ActivatedRoute,
              private articleSvc: ArticleService,
              private userSvc: UserService,
              private router: Router,
            ) { }

  ngOnInit() {
    this.setArticleId();
    this.getArticleHistory();
  }

  ngOnDestroy() {
    this.stopIterating();
  }

  // each times params change check key agains current displayed article key and if not the same, update.
  setArticleId() {
    this.route.params.subscribe(params => {
      if (params['key'] && params['version']) {
        const { key, version } = params;
        this.articleId = key;
        // @MAYT: converting it to number here...
        this.articleVersion = +version;
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
    });
  }
  
  navigateToVersion(version) {
    this.router.navigate([`article/${this.articleId}/${version}`]);
  }

  // @MAYT and not needing to parseInt here...
  nextVersion() {
    this.router.navigate([`article/${this.articleId}/${this.articleVersion + 1}`]);
  }
  
  prevVersion() {
    this.router.navigate([`article/${this.articleId}/${this.articleVersion - 1}`]);
  }
  
  latestVersion() {
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[0]}`]);
  }
  
  firstVersion() {
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[this.articleHistoryKeys.length - 1]}`]);
  }

  // @MAYT: using setInterval instead of recursive funciton with setTimeout. Also some syntactic sugar in there...
  iterateVersions = () => {
    this.historyTicker = setInterval(() => {
      // MAYT Object destructuring is the new cool, even the "this" object can be destructured...
      const { articleVersion, articleHistoryKeys } = this;
      this.articleVersion = articleVersion >= articleHistoryKeys.length ? 0 : this.articleVersion;
      this.nextVersion()
    }, 1800);
    this.paused = false;
  };
  
  // iterateVersions() {    
  //   setTimeout(() => {
  //     if (!this.paused) {
  //       if (parseInt(this.articleVersion) >= this.articleHistoryKeys.length) {
  //         this.articleVersion = '0';
  //       }
  //       this.nextVersion();
  //       this.iterateVersions();
  //     }
  //   }, 3000);
  // }

  // @MAYT: it's a good general practice to use arrow functions unless a good reason for not using them. Helps keep scope of "this" from getting out of hand.
  // Also, using the interval we can have pretty granular control over its actions.
  // I noticed that with the old approach I could do things like navigate away from the article while it was running and it would bug out and send me back...
  // It's really easy now to just create an ngOnDestry method and call stopIterating() to prevent that error.
  stopIterating = () => {
    clearInterval(this.historyTicker)
    // @MAYT: The paused property is still useful to keep the UI in sync, etc... but I'd suggest inverting things by making it something like "this.isIterating"
    this.paused = true;
  };

  // pauseIteration() {
  //   this.paused = true;
  // }
}
