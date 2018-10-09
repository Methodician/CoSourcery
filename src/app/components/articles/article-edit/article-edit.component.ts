import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Upload } from 'app/shared/class/upload';
import { ArticleService } from '../../../services/article.service';
import { UploadService } from '../../../services/upload.service';
import { UserService } from '../../../services/user.service';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  userInfo = null;
  articleId: any;
  articleIsNew: boolean;
  formIsReady: boolean = false;
  currentArticleSubscription: Subscription;

  selectedCoverImageFile: any;
  currentCoverImageUpload: Upload;
  ckeditor = InlineEditor;
  ckeditorConfig = {toolbar: {viewportTopOffset: 70}};

  readonly matChipInputSeparatorKeyCodes: number[] = [ENTER];

  articleEditForm = this.fb.group({
    articleId: '',
    authorId: '',
    title: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    introduction: ['', [
      Validators.required,
      Validators.maxLength(300)
    ]],
    body: [''],
    imageUrl: ['', Validators.required],
    imageAlt: ['', Validators.maxLength(100)],
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

  // Form Setup & Breakdown Functions
  setArticleId() {
    if (this.route.params['_value']['key']) {
      this.articleId = this.route.params['_value']['key'];
      this.articleIsNew = false;
    } else {
      this.articleId = this.articleSvc.createArticleId();
      this.articleIsNew = true;
    }
  }

  subscribeToArticleId() {
    this.articleSvc.setCurrentArticle(this.articleId);
    this.currentArticleSubscription = this.articleSvc.currentArticle$.subscribe(articleData => {
      if (!this.formIsReady) {
        this.setDefaultFormData(articleData);
        this.formIsReady = true;
      } else {
        this.updateCoverImageUrl(articleData.imageUrl);
      }
    });
  }

  setDefaultFormData(data) {
    if (!this.articleIsNew) {
      this.articleEditForm.patchValue(data);
    }
  }

  async saveChanges() {
    if (!this.articleEditForm.value.articleId) {
      const saveArticle = await this.articleSvc.createArticle(this.userInfo, this.articleEditForm.value, this.articleId);
      if (saveArticle === 'success') {
        this.articleIsNew = false;
      }
    } else {
      this.articleSvc.updateArticle(this.userInfo, this.articleEditForm.value, this.articleId);
    }
  }

  abortChanges() {
    this.currentArticleSubscription.unsubscribe();
    if (this.articleIsNew) {
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
      this.uploadSvc.uploadArticleCoverImage(this.currentCoverImageUpload, this.articleId, this.articleIsNew);
    }
  }

  updateCoverImageUrl(url) {
    this.articleEditForm.patchValue({imageUrl: url});
  }

  // Article Tagging Functions
  addTag(event: MatChipInputEvent): void {
    const inputElement = event.input;
    const tag = event.value.toUpperCase();
    const isDuplicate = this.checkForDuplicateTag(tag);
    if (tag.trim() && !isDuplicate) {
      this.articleEditForm.value.tags.push(tag.trim());
    }
    if (inputElement) {
      inputElement.value = '';
    }
  }

  checkForDuplicateTag(value) {
    const tagIndex = this.articleEditForm.value.tags.indexOf(value);
    return (tagIndex >= 0) ? true : false;
  }

  removeTag(selectedTag): void {
    const tagIndex = this.articleEditForm.value.tags.indexOf(selectedTag);
    if (tagIndex >= 0) {
      this.articleEditForm.value.tags.splice(tagIndex, 1);
    }
  }

  // Manual Input Validation
  isInvalidTagInput(value) {
    const nonLetterNumberSpace = new RegExp('[^a-zA-Z0-9 ]');
    return nonLetterNumberSpace.test(value) ? true : false;
  }

}
