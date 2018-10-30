import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
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
  UserId;
  featuredArticles;
  latestArticles: Observable<ArticleDetailFirestore[]>;
  allArticles: Observable<ArticleDetailFirestore[]>;
  bookmarkedArticles;
  currentSelectedTab: SelectedTab = SelectedTab.latest;


  constructor(
    private articleSvc: ArticleService,
    private authSvc: AuthService) { }

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

}

export enum SelectedTab {
  'latest' = 1,
  'all',
  'bookmark'
}
