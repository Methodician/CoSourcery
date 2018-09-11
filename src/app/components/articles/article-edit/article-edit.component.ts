import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Upload } from 'app/shared/class/upload';
import { ArticleService } from '../../../services/article.service';
import { UploadService } from '../../../services/upload.service';
import { UserService } from '../../../services/user.service';

import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  userInfo = null;
  articleId: any;
  isArticleNew: boolean;
  currentArticleSubscription: Subscription;

  selectedCoverImageFile: any;
  currentCoverImageUpload: Upload;
  readonly matChipInputSeparatorKeysCodes: number[] = [ENTER];

  articleEditForm: FormGroup = this.fb.group({
    articleId: '',
    authorId: '',
    title: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    introduction: ['', Validators.required],
    body: ['', Validators.required],
    imageUrl: '',
    imageAlt: '',
    authorImageUrl: '',
    lastUpdated: null,
    timestamp: 0,
    lastEditorId: '',
    version: 1,
    commentCount: 0,
    viewCount: 0,
    tags: [[]],
    isFeatured: false,
  });

  constructor(
    private fb: FormBuilder,
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

  // Form Initialization, Cancellation, & Completion Functions
  setArticleId() {
    if (this.route.params['_value']['key']) {
      this.articleId = this.route.params['_value']['key'];
      this.isArticleNew = false;
    } else {
      this.articleId = this.articleSvc.createArticleId();
      this.isArticleNew = true;
    }
  }

  subscribeToArticleId() {
    this.articleSvc.setCurrentArticle(this.articleId);
    this.currentArticleSubscription = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (articleData) {
        this.setDefaultFormData(articleData);
      }
    });
  }

  setDefaultFormData(data) {
    this.articleEditForm.setValue(data);
  }

  saveChanges() {
    if (!this.articleEditForm.value.articleId) {
      this.articleSvc.createArticle(this.userInfo, this.articleEditForm.value, this.articleId);
    } else {
      this.articleSvc.updateArticle(this.userInfo, this.articleEditForm.value, this.articleId);
    }
  }

  abortChanges() {
    this.currentArticleSubscription.unsubscribe();
    if (this.isArticleNew) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
  }

  // Cover Image Upload Functions
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

  // Article Tagging Functions
  addTag(event: MatChipInputEvent): void {
    const inputElement = event.input;
    const tag = event.value.toUpperCase();
    if ((tag || '').trim()) {
      this.articleEditForm.value.tags.push(tag.trim());
    }
    if (inputElement) {
      inputElement.value = '';
    }
  }

  removeTag(selectedTag): void {
    const tagIndex = this.articleEditForm.value.tags.indexOf(selectedTag);
    if (tagIndex >= 0) {
      this.articleEditForm.value.tags.splice(tagIndex, 1);
    }
  }

  // Validation
  isErrorVisible(field: string, error: string) {
    const control = this.articleEditForm.controls[field];
    return control.dirty && control.errors && control.errors[error];
  }

  isInvalidTagInput(value) {
    const nonLetterNumberSpace = new RegExp('[^a-zA-Z0-9 ]');
    return nonLetterNumberSpace.test(value) ? true : false;
  }

}
