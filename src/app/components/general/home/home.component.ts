import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { SuggestionService } from '../../../services/suggestion.service';
@Component({
  selector: 'cos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  testData: any;
  testDataB: any;
  constructor(
    private articleSvc: ArticleService,
    private SuggSvc: SuggestionService,
  ) { }

  ngOnInit() {
    // const suggSlugg = {title: 'test suggestion', pitch: 'hire me for lots of money to write code and content'};
    // this.testData = this.SuggSvc.saveSuggestion(suggSlugg);
    // const suggSluggB = {title: 'WOOOT!', pitch: 'Hire me and Nico for lots of money to write code and content'};
    // this.SuggSvc.updateSuggestion('SfSVPu2oE8NOp0YD9SD0', suggSluggB);
    // this.testData = this.SuggSvc.getAllSuggestions();
    // console.log(this.testData);
    // this.testDataB = this.SuggSvc.getSuggestionById('SfSVPu2oE8NOp0YD9SD0'),
    // console.log(this.testDataB);

  }



}
