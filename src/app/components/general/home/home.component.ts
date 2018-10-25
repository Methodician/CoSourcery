import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailFirestore } from '../../../shared/class/article-info';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  routeParams;
  UserId;
  featuredArticles;
  latestArticles;
  allArticles;
  bookmarkedArticles;
  currentSelectedTab: SelectedTab = SelectedTab.latest;


  constructor(
    private route: ActivatedRoute,
    private articleSvc: ArticleService,
    private authSvc: AuthService) { }

  ngOnInit() {
    this.initializeArticles();
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo) {
        this.UserId = authInfo.uid;
        this.watchBookmarkedArticles();
      }
    });
  }

  async initializeArticles() {
    this.latestArticles = await this.articleSvc.latestArticlesRef();
    this.allArticles = await this.articleSvc.allArticlesRef();
  }

  watchBookmarkedArticles(){
    this.articleSvc.watchBookmarkedArticles(this.UserId);
    this.articleSvc.bookmarkedArticles$.subscribe(list => {
      this.bookmarkedArticles = list;
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

}

export enum SelectedTab {
  'latest' = 1,
  'all',
  'bookmark'
}
