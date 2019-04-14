import { Component, OnInit, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ArticleService } from '@services/article.service';
import { ArticlePreview } from '@class/article-info';
import { AuthService } from '@services/auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TabList, TabItem } from '../filter-menu/filter-menu.component';

@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService],
})
export class HomeComponent implements OnInit {
  @ViewChild('filterMenu') filterMenu;
  userId;

  featuredArticles;
  latestArticles: Observable<ArticlePreview[]>;
  allArticles: Observable<ArticlePreview[]>;
  bookmarkedArticles;
  searchedArticles;
  query: string;

  filterTabs = [
    { name: 'Latest', selected: true },
    { name: 'All', selected: false },
  ];

  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit() {
    this.initializeArticles();
    this.watchAuthInfo();
    this.watchRoutePrams();
    this.updateMetaData();
  }

  updateMetaData = () => {
    this.title.setTitle('CoSourcery - Discover cool stuff!');
    const description =
      "CoSourcery is empowering the makers and hackers of the world to discover and share useful information about how to accomplish their goals. We're really into decentralized farming and indoor gardening";
    this.meta.addTag({ name: 'description', content: description });
  };

  initializeArticles() {
    this.latestArticles = this.articleSvc.latestArticlesRef().valueChanges();
    this.allArticles = this.articleSvc.allArticlesRef().valueChanges();
  }

  watchRoutePrams() {
    this.route.params.subscribe(params => {
      if (params['query']) {
        this.query = params['query'];
        this.addFilterTab({ name: 'Search Results', selected: false });
        this.searchArticles(this.query);
      }
    });
  }

  watchAuthInfo() {
    this.authSvc.authInfo$.subscribe(authInfo => {
      this.userId = authInfo.uid;
      if (this.userId) {
        this.watchBookmarkedArticles();
        this.addFilterTab({ name: 'Bookmarked', selected: false });
      }
    });
  }

  watchBookmarkedArticles() {
    this.articleSvc.watchBookmarkedArticles(this.userId).subscribe(articles => {
      this.bookmarkedArticles = articles;
    });
  }

  searchArticles(query) {
    this.articleSvc.searchArticles(query);
    this.articleSvc.searchedArticles$.subscribe(articles => {
      this.searchedArticles = articles;
    });
  }

  // UI Data Display
  addFilterTab(tab: TabItem) {
    // Wanted to implemnt this inside filter menu component but chagne detection was wonky
    if (!this.filterMenu.getTabByName(tab.name)) {
      this.filterTabs.push(tab);
    }
  }

  onFilterTabAdded($event: TabList) {
    // Attempting to select the tab immediately after addFilterTab in watchRouteParams
    // failed because it didn't quite exist yet.
    const lastTabIndex = $event.length - 1;
    const newestTabName = $event[lastTabIndex].name;
    if (newestTabName === 'Search Results') {
      this.filterMenu.selectTab(lastTabIndex);
    }
  }

  // didn't end up using this (yet)
  onFilterTabSelected($event: number) {
    // console.log('filterTabSelected', $event);
  }
}
