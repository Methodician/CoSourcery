import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailFirestore } from '../../../shared/class/article-info';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  routeParams;
  uid;
  featuredArticles: ArticleDetailFirestore[];
  latestArticles: ArticleDetailFirestore[];
  allArticles: ArticleDetailFirestore[];
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
        this.uid = authInfo.uid;
      }
    });
  }

  async initializeArticles() {
    this.latestArticles = await this.articleSvc.getLatestArticles();
    this.allArticles = await this.articleSvc.getAllArticles();
    this.articleSvc.watchBookmarkedArticles(this.uid);
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


