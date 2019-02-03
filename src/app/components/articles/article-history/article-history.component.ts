import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { formatDate } from '@angular/common';
import { ArticleService } from '@services/article.service';
import { UserService } from '@services/user.service';
import { UserMap } from '@class/user-info';

@Component({
  selector: 'cos-article-history',
  templateUrl: './article-history.component.html',
  styleUrls: ['./article-history.component.scss'],
  encapsulation: ViewEncapsulation.None, // needed to allow styles to work in article-body section generated via the [innerHTML]. See https://stackoverflow.com/questions/44210786/style-not-working-for-innerhtml-in-angular-2-typescript
})
export class ArticleHistoryComponent implements OnInit {

  articleId: string = null;
  articleVersion: number = null;
  articleHistory = {};
  articleHistoryKeys = [];
  keysPosition: number;
  articleContributorIds: string[];

  private yScroll: number;

  // History Navigation Logic
  isIterating = false;
  historyTicker = null;
  userMap: UserMap;
  
  
  displayedColumns: string[] = ['version', 'date', 'lastEditorId'];

  constructor(
              private route: ActivatedRoute,
              private articleSvc: ArticleService,
              private userSvc: UserService,
              private router: Router,
            ) {
              this.userMap = userSvc.userMap;
            }

  ngOnInit() {
    this.checkYPosition();
    this.setArticleId();
    this.getArticleHistory();
  }

  ngOnDestroy() {
    this.stopIterating();
  }

  // Keeps scroll position when navigating between article versions
  // Supposedly there is a more "Angular" way of doing this using the ViewportScroller but it is poorly documented.
  // Check it out at: https://angular.io/api/router/ExtraOptions#scrollPositionRestoration
  checkYPosition() {
    this.router.events.subscribe((ev:any) => {
      if (ev instanceof NavigationStart) {
        this.yScroll = window.scrollY;
      } else if (ev instanceof NavigationEnd && ev.url.includes(this.articleId)) {
        window.scrollTo(0, this.yScroll);
      }
    });
  }

  // each times params change check key agains current displayed article key and if not the same, update.
  setArticleId() {
    this.route.params.subscribe(params => {
      if (params['key'] && params['version']) {
        const { key, version } = params;
        this.articleId = key;
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
      this.articleHistoryKeys.sort((key1, key2) => this.articleHistory[key1].version < this.articleHistory[key2].version ? 1 : -10)
      this.keysPosition = this.articleHistoryKeys.indexOf(this.articleVersion.toString());
      
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
    this.stopIterating();
    this.router.navigate([`article/${this.articleId}/${version}`]);
  }

  nextVersion = () => {
    this.stopIterating();
    this.keysPosition = this.keysPosition - 1 < 0 ? this.articleHistoryKeys.length -1 : this.keysPosition - 1;
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[this.keysPosition]}`]);
  }
  
  prevVersion = () => {
    this.stopIterating();
    this.keysPosition = this.keysPosition + 1 > this.articleHistoryKeys.length -1 ? 0 : this.keysPosition + 1;
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[this.keysPosition]}`]);
  }
  
  latestVersion() {
    this.stopIterating();
    this.keysPosition = 0;
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[this.keysPosition]}`]);
  }
  
  firstVersion() {
    this.stopIterating();
    this.keysPosition = this.articleHistoryKeys.length - 1;
    this.router.navigate([`article/${this.articleId}/${this.articleHistoryKeys[this.keysPosition]}`]);
  }

  iterateVersions = () => {
    this.historyTicker = setInterval(() => {
      const { articleVersion, articleHistoryKeys } = this;
      this.articleVersion = articleVersion > articleHistoryKeys.length ? 0 : this.articleVersion;
      this.nextVersion()
    }, 1800);
    this.isIterating = true;
  };

  stopIterating = () => {
    clearInterval(this.historyTicker)
    this.isIterating = false;
  };

  editorDisplayText = (historyKey: string) => {
    const version = this.articleHistory[historyKey].version;
    const lastUpdated = this.articleHistory[historyKey].lastUpdated.toDate();
    const displayDate = formatDate(lastUpdated, 'yy-MM-dd', 'en');
    return `v${version}, updated ${displayDate}`;
  }

  editorFromArticleKey = (historyKey: string) => {
    return this.userMap[this.articleHistory[historyKey].lastEditorId];
  }

  isEditorCreator = (historyKey: string) => {
    const { articleHistory } = this;
    const editorId = articleHistory[historyKey].lastEditorId;
    const authorId = articleHistory[historyKey].authorId;
    // console.log({authorId, editorId});
    return editorId === authorId;
  }



}