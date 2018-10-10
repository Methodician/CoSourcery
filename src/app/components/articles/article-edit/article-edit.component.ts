import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { Upload } from 'app/shared/class/upload';
import { ArticleService } from '../../../services/article.service';
import { UploadService } from '../../../services/upload.service';
import { UserService } from '../../../services/user.service';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { AngularFireUploadTask } from '@angular/fire/storage';

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
  unsavedCoverImage = false;
  currentArticleSubscription: Subscription;
  readonly matChipInputSeparatorKeyCodes: number[] = [ENTER];

  coverImageFile: File;
  tempCoverImageUploadPath: string;
  coverImageUploadTask: AngularFireUploadTask;
  coverImageUploadPercent$: Observable<number>;
  coverImageUrl$ = new BehaviorSubject<string>(null);

  // selectedCoverImageFile: any;
  // currentCoverImageUpload: Upload;
  ckeditor = InlineEditor;
  ckeditorConfig = { toolbar: { viewportTopOffset: 70 } };

  editCoverImage: boolean = false;
  editTitle: boolean = false;
  editIntro: boolean = false;
  editBody: boolean = false;
  editTags: boolean = false;

  articleEditForm = this.fb.group({
    articleId: '',
    authorId: '',
    title: ['Title', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    introduction: ['Introduction', [
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
    this.route.params.subscribe(params => {
      if (params['key']) {
        this.articleId = params['key'];
        this.articleIsNew = false;
      } else {
        this.articleId = this.articleSvc.createArticleId();
        this.articleIsNew = true;
      }
    });
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
      this.coverImageUrl$.next(data.imageUrl);
    }
    this.articleEditForm.markAsPristine();
  }

  async saveChanges() {
    if (this.coverImageFile) {
      await this.saveCoverImage();
      this.deleteTempCoverImage();
      this.coverImageFile = null;
    }
    if (!this.articleEditForm.value.articleId) {
      const articleSaved = await this.articleSvc.createArticle(this.userInfo, this.articleEditForm.value, this.articleId);
      if (articleSaved === 'success') {
        this.articleIsNew = false;
      }
    } else {
      this.articleSvc.updateArticle(this.userInfo, this.articleEditForm.value, this.articleId);
    }
    this.articleEditForm.markAsPristine();
    this.editCoverImage = false;
    this.editTitle = false;
    this.editIntro = false;
    this.editBody = false;
    this.editTags = false;
  }

  abortChanges() {
    this.currentArticleSubscription.unsubscribe();
    this.cancelUpload(this.coverImageUploadTask);
    this.deleteTempCoverImage
    if (this.articleIsNew) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
  }

  // Cover Image Upload Functions
  async onSelectCoverImage(e: HtmlInputEvent) {
    this.coverImageFile = e.target.files.item(0);
    const tracker = this.articleSvc.uploadTempImage(this.coverImageFile);
    this.coverImageUploadTask = tracker.task;
    this.coverImageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.coverImageUrl$.next(url);
    this.tempCoverImageUploadPath = snap.metadata.fullPath;
    this.unsavedCoverImage = true;
  }

  async saveCoverImage() {
    const tracker = this.articleSvc.uploadCoverImage(this.articleId, this.coverImageFile);
    this.coverImageUploadTask = tracker.task;
    this.coverImageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.updateCoverImageUrl(url);
    this.articleSvc.trackUploadedCoverImages(this.articleId, snap.metadata.fullPath, url);
    return;
  }

  deleteTempCoverImage() {
    this.articleSvc.deleteFile(this.tempCoverImageUploadPath);
  }

  cancelUpload(task: AngularFireUploadTask) {
    if (task)
      task.cancel();
  }

  updateCoverImageUrl(url) {
    this.articleEditForm.patchValue({ imageUrl: url });
    this.coverImageUrl$.next(url);
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

  articleHasUnsavedChanges(): boolean {
    return !!this.coverImageFile || this.articleEditForm.dirty;
  }

}

export interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}