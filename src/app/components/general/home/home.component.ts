import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  testData: any;
  constructor(
    private articleSvc: ArticleService
  ) { }

  ngOnInit() {
    // this.testData = this.articleSvc.getAllArticles();
    // this.testData = this.articleSvc.getLatestArticles();
    // this.testData = this.articleSvc.getArticleById('-KvdKvEN1RqI-Nykd55g');
    // this.testData = this.articleSvc.getArticleBody('-KvdKvEJp15zRas8xKWr');
    this.testData = this.articleSvc.getFullArticleById('-KvdKvEN1RqI-Nykd55g');
  }

}
