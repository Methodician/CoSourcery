import { Component, OnInit, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '@services/article.service';

@Component({
  selector: 'cos-article-history',
  templateUrl: './article-history.component.html',
  styleUrls: ['./article-history.component.scss']
})
export class ArticleHistoryComponent implements OnInit {

  articleId:string = null;
  articleVersion:string = null;
  articleHistory = {};
  articleHistoryKeys = [];


  constructor(
              private route: ActivatedRoute,
              private articleSvc: ArticleService,
            ) { }

  ngOnInit() {
    this.setArticleId();
    this.getArticleHistory();
  }


  // each times params change check key agains current displayed article key and if not the same, update.
  
  setArticleId() {
    this.route.params.subscribe(params => {
      if (params['key'] && params['version']) {
        const {key, version} = params;
        this.articleId = key;
        this.articleVersion = version;
      }
      // this.ckeditor.config.fbImageStorage = { storageRef: this.articleSvc.createVanillaStorageRef(`articleBodyImages/${this.articleId}/`) };
    });
  }

  getArticleHistory() {
    this.articleSvc.getArticleHistoryRefById(this.articleId).valueChanges().subscribe(history => {
      // this.articleHistory = history;
      history.map(article => {
        this.articleHistory[article.version] = article;
      });
      this.articleHistoryKeys = Object.keys(this.articleHistory);

    });
  }
}
