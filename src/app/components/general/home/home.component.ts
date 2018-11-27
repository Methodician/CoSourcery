import { Component, OnInit, ViewChild } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ArticlePreview } from '../../../shared/class/article-info';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService]
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

  filterMenuIsSticky: boolean;
  filterContainerHeight: number;
  currentSelectedTab: SelectedTab = SelectedTab.latest;

  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.initializeArticles();
    this.watchAuthInfo();
    this.route.params.subscribe(params => {
      if (params['query']) {
        this.query = params['query'];
        this.currentSelectedTab = SelectedTab.search;
        this.searchArticles(this.query);
      }
    });
  }

  initializeArticles() {
    this.latestArticles = this.articleSvc.latestArticlesRef().valueChanges();
    this.allArticles = this.articleSvc.allArticlesRef().valueChanges();
  }

  watchAuthInfo() {
    this.authSvc.authInfo$.subscribe(authInfo => {
      this.userId = authInfo.uid;
      if (this.userId) {
        this.watchBookmarkedArticles();
      }
      const delay = true;
      this.setFilterContainerHeight(delay);
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
  selectLatest() {
    this.currentSelectedTab = SelectedTab.latest;
  }

  selectAll() {
    this.currentSelectedTab = SelectedTab.all;
  }

  selectBookmark() {
    this.currentSelectedTab = SelectedTab.bookmark;
  }

  selectSearch() {
    this.currentSelectedTab = SelectedTab.search;
  }

  // UI Sticky Filter Menu
  checkScrollPosition() {
    const yCoordinate = window.scrollY;
    if (document.body.clientWidth >= 482) {
      this.filterMenuIsSticky = yCoordinate >= 200 ? true : false;
    } else {
      this.filterMenuIsSticky = true;
    }
  }

  adjustFilterContainerOnResize() {
    this.checkScrollPosition();
    this.setFilterContainerHeight();
  }

  setFilterContainerHeight(delay = false) {
    if (!delay) {
      this.filterContainerHeight = this.filterMenu.nativeElement.clientHeight;
    } else {
      setTimeout(() => {
        this.filterContainerHeight = this.filterMenu.nativeElement.clientHeight;
      }, 100);
    }
  }

}

export enum SelectedTab {
  'latest' = 1,
  'all',
  'bookmark',
  'search'
}
