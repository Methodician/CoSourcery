import { Component, OnInit } from '@angular/core';
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
  query: string;
  UserId;
  featuredArticles;
  latestArticles: Observable<ArticlePreview[]>;
  allArticles: Observable<ArticlePreview[]>;
  bookmarkedArticles;
  searchedArticles;
  currentSelectedTab: SelectedTab = SelectedTab.latest;


  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.initializeArticles();

    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo) {
        this.UserId = authInfo.uid;
        if (this.UserId) {
          this.watchBookmarkedArticles();
        }
      }
    });

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

  watchBookmarkedArticles() {
    this.articleSvc.watchBookmarkedArticles(this.UserId).subscribe(articles => {
      this.bookmarkedArticles = articles;
    });
  }

  // Methods for toggling between Latest and All Previews
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

  searchArticles(query) {
    this.articleSvc.searchArticles(query);
    this.articleSvc.searchedArticles$.subscribe(articles => {
      this.searchedArticles = articles;
    });
  }

}

export enum SelectedTab {
  'latest' = 1,
  'all',
  'bookmark',
  'search'
}
