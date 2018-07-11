import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailFirestore } from '../../../shared/class/article-info';
@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  routeParams;
  featuredArticles: ArticleDetailFirestore[];
  latestArticles: ArticleDetailFirestore[];
  allArticles: ArticleDetailFirestore[];
  currentSelectedFeaturePreview: SelectedPreview = SelectedPreview.latestList;
  currentSelectedLatestPreview: SelectedPreview = SelectedPreview.latestTile;
  currentSelectedTab: SelectedTab = SelectedTab.latest;
  currentSelectedAllPreview: SelectedPreview = SelectedPreview.latestTile;

  constructor(private route: ActivatedRoute, private articleSvc: ArticleService, ) { }

  ngOnInit() {
    this.initializeArticles();
``

  }

  async initializeArticles() {
    // Doesn't even really need a comment since the code describes the action.
    this.featuredArticles = await this.articleSvc.getFeaturedArticles();
    this.latestArticles = await this.articleSvc.getLatestArticles();
    this.allArticles = await this.articleSvc.getAllArticles();
  }

  // Methods for toggling between Latest and All Previews
  selectLatest() {
    this.currentSelectedTab = SelectedTab.latest;
  }

  selectAll() {
    this.currentSelectedTab = SelectedTab.all;
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

}

export enum SelectedTab {
  'latest' = 1,
  'all'
}

export enum SelectedPreview {
  'featuredList' = 1,
  'featuredTile',
  'latestList',
  'latestTile',
  'allList',
  'allTile'
}
