import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Upload } from 'app/shared/class/upload';
import { ArticleService } from '../../../services/article.service';
import { UploadService } from '../../../services/upload.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  userInfo = null;
  articleId: any;
  article: any;
  isArticleValid: boolean;
  isArticleNew: boolean;
  currentArticleSubscription: Subscription;

  currentCoverImageUpload: Upload;
  selectedCoverImageFile: any;

  constructor(
    private route: ActivatedRoute,
    private articleSvc: ArticleService,
    private uploadSvc: UploadService,
    private userSvc: UserService
  ) { }

  ngOnInit() {
    this.userSvc.userInfo$.subscribe(user => {
      this.userInfo = user;
    });
    this.setArticleId();
    this.subscribeToArticleId();
  }

  ngOnDestroy() {
    this.abortChanges();
  }

  setArticleId() {
    if (this.route.params['_value']['key']) {
      this.articleId = this.route.params['_value']['key'];
      this.isArticleValid = true;
      this.isArticleNew = false;
    } else {
      this.articleId = this.articleSvc.createArticleId();
      this.isArticleValid = false;
      this.isArticleNew = true;
    }
  }

  subscribeToArticleId() {
    this.articleSvc.setCurrentArticle(this.articleId);
    this.currentArticleSubscription = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
        this.article = articleData;
      }
    });
  }

  abortChanges() {
    this.currentArticleSubscription.unsubscribe();
    if (!this.isArticleValid) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
  }

  captureCoverImage(selectedFile) {
    this.selectedCoverImageFile = selectedFile;
    return this.selectedCoverImageFile;
  }

  uploadCoverImage() {
    if (!!this.articleId) {
      this.currentCoverImageUpload = new Upload(this.selectedCoverImageFile);
      this.uploadSvc.uploadArticleCoverImage(this.currentCoverImageUpload, this.articleId, this.isArticleNew);
    }
  }

  async saveArticle(article) {
    if (!article.articleId) {
      const creationCheck = await this.articleSvc.createArticle(this.userInfo, article, this.articleId);
      if (creationCheck === 'success') {
        this.isArticleValid = true;
      }
    } else {
      this.articleSvc.updateArticle(this.userInfo, article, this.articleId);
    }
  }

}
