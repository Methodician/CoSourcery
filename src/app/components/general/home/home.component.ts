import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit {
  routeParams;
  featuredArticles = [];
  latestArticles;
  allArticles;
  currentSelectedTab: SelectedTab = SelectedTab.latest;
  currentSelectedFeaturePreview: SelectedPreview = SelectedPreview.featuredList;
  currentSelectedLatestPreview: SelectedPreview = SelectedPreview.latestTile;
  currentSelectedAllPreview: SelectedPreview = SelectedPreview.allTile;

  constructor(private route: ActivatedRoute, private articleSvc: ArticleService, ) { }

  // async ngOnInit() {
  ngOnInit() {
    // call for Featured Articles
    // this.articleSvc
    //   .getFeaturedArticles()
    //   .valueChanges()
    //   .subscribe(articles => {
    //     this.featuredArticles = articles;
    //   });
    //  different Firestore way (rather diferent observable way - maybe not better):
    this.articleSvc
      .getFeaturedArticles().then(articles => { this.featuredArticles = articles; console.log(this.featuredArticles);
      });

    // call For Latest Articles
    this.articleSvc
      .getLatestArticles().then(latest => {this.latestArticles = latest; console.log(this.latestArticles);
       });

    //  call for All Articles
    this.articleSvc
      .getAllArticles().then(responce => { this.allArticles = responce; console.log(this.allArticles);
       });

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
