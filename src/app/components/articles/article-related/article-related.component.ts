import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'cos-article-related',
  templateUrl: './article-related.component.html',
  styleUrls: ['./article-related.component.scss']
})
export class ArticleRelatedComponent implements OnInit, OnChanges {
  @Input() any;
  @Input() parentTags: any;
  relatedArticles: any;
  currentArticle = 0;

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  constructor(private articleSvc: ArticleService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentTags'] && changes['parentTags'].currentValue) {
      // this.relatedArticles = this.articleSvc.getArticlesPerTag(this.parentTags);
      this.currentArticle = 0;
    }
  }

  // nextArticle(){
  //   if(this.currentArticle != this..length - 1){
  //     this.currentArticle++;
  //   }
  // }

  // prevArticle(){
  //   if(this.currentArticle != 0){
  //     this.currentArticle--;
  //   }
  // }
  // positionWrapper():string{
  //   return `${-320 * this.currentArticle}px`;
  // }

  // swipe(action = this.SWIPE_ACTION.RIGHT) {
  //   if (action === this.SWIPE_ACTION.RIGHT) {
  //     this.prevArticle();
  //   }
  //   if (action === this.SWIPE_ACTION.LEFT) {
  //     this.nextArticle();
  //   }
  // }

  hasRelatedArticles(){
    if (this.relatedArticles){
      return this.relatedArticles.length === 0 ?  false : true;
    }
  }

}
