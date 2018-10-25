import { Component, OnInit, Input } from '@angular/core';
import { ArticleService } from '../../../services/article.service';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
import { Router } from '@angular/router';

@Component({
  selector: 'cos-article-preview-list',
  templateUrl: './article-preview-list.component.html',
  styleUrls: ['./article-preview-list.component.scss']
})
export class ArticlePreviewListComponent implements OnInit {
  @Input() articleData: ArticleDetailFirestore;
  author;
  articleCoverImageUrl;
  hoverClass: string;
  hoverBg: string;
  constructor(
    private articleService: ArticleService,
    private router: Router

  ) { }

  ngOnInit() {
    this.author = this.articleService
    .getAuthor(this.articleData.authorId);
  }

  navigateToArticleDetail() {
    this.router.navigate([`articledetail/${this.articleData.articleId}`]);
  }

  navigateToProfile() {
    this.router.navigate([`profile/${this.articleData.authorId}`]);
  }


  hoverArticleCard() {
    this.hoverClass = this.hoverClass === '' ? 'hover-bg' : '';
    this.hoverBg = this.hoverBg === '' ? 'rgba(0,184,212, 0.15)' : '';
  }

  exitCard() {
    this.hoverClass = '';
    this.hoverBg = '';
  }

  enterCard() {
    this.hoverClass = 'hover-bg';
    this.hoverBg = 'rgba(0,184,212, 0.15)';
  }

}
