import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../../../services/upload.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';

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
    private router: Router,
    private uploadSvc: UploadService
  ) { }

  ngOnInit() {
    this.author = this.articleService
    .getAuthor(this.articleData.authorId);
    this.getArticleCoverImage();
  }

  navigateToArticleDetail() {
    this.articleService.navigateToArticleDetail(this.articleData.articleId);
  }

  navigateToProfile() {
    this.articleService.navigateToProfile(this.articleData.authorId);
  }

  async getArticleCoverImage() {
    const basePath = 'uploads/articleCoverImages';
    this.articleCoverImageUrl = await this.uploadSvc
      .getImageUrl(this.articleData.articleId, basePath);
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
