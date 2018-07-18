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
  uid = null;
  featuredArticles: ArticleDetailFirestore[];
  latestArticles: ArticleDetailFirestore[];
  allArticles: ArticleDetailFirestore[];
  bookmarkedArticles;
  currentSelectedFeaturePreview: SelectedPreview = SelectedPreview.latestList;
  currentSelectedLatestPreview: SelectedPreview = SelectedPreview.latestTile;
  currentSelectedTab: SelectedTab = SelectedTab.latest;
  currentSelectedAllPreview: SelectedPreview = SelectedPreview.allTile;
  currentSelectedBookmarkPreview: SelectedPreview = SelectedPreview.bookmarkedList;

  constructor(private route: ActivatedRoute, private articleSvc: ArticleService, private authSvc: AuthService) { }

  ngOnInit() {
    this.initializeArticles();
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo) {
        this.uid = authInfo.uid;
      }
    });
  }

  async initializeArticles() {
    // Doesn't even really need a comment since the code describes the action.
    // this.featuredArticles = await this.articleSvc.getFeaturedArticles();
    this.latestArticles = await this.articleSvc.getLatestArticles();
    this.allArticles = await this.articleSvc.getAllArticles();
    this.articleSvc.bookmarkedArticles$.subscribe(list => {
      this.bookmarkedArticles = list;
    });
    this.articleSvc.watchBookmarkedArticles(this.uid);

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

  // Methods for toggling between Featured Article List and Grid Previews
  featuredListView() {
    this.currentSelectedFeaturePreview = SelectedPreview.featuredList;
  }

  featuredTileView() {
    this.currentSelectedFeaturePreview = SelectedPreview.featuredTile;
  }

  // Methods for toggling between Latest Article List and Grid Preview
  latestListView() {
    this.currentSelectedLatestPreview = SelectedPreview.latestList;
  }

  latestTileView() {
    this.currentSelectedLatestPreview = SelectedPreview.latestTile;
  }

  // Methods for Toggling between All Article List and Grid Preview
  allListView() {
    this.currentSelectedAllPreview = SelectedPreview.allList;
  }

  allTileView() {
    this.currentSelectedAllPreview = SelectedPreview.allTile;
  }

  // Methods for Toggling between Bookmarked Article List and Grid Preview
  bookmarkedListView() {
    this.currentSelectedBookmarkPreview = SelectedPreview.bookmarkedList;
  }

  bookmarkedTileView() {
    this.currentSelectedBookmarkPreview = SelectedPreview.bookmarkedTitle;
  }

}

export enum SelectedTab {
  'latest' = 1,
  'all',
  'bookmark'
}

export enum SelectedPreview {
  'featuredList' = 1,
  'featuredTile',
  'latestList',
  'latestTile',
  'allList',
  'allTile',
  'bookmarkedList',
  'bookmarkedTitle',
}
