import { Component, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { UserInfoOpen, UserMap } from 'app/shared/class/user-info';
import { CommentService } from 'app/services/comment.service';
import { Comment, ParentTypes, KeyMap, VoteDirections } from 'app/shared/class/comment';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  @ViewChild('ckeditorBoundingBox') ckeditorBoundingBox;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.articleHasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  loggedInUser: UserInfoOpen = null;
  articleId: any;
  articleIsNew: boolean;
  formIsReady = false;
  tagsEdited = false;
  currentArticleSubscription: Subscription;
  readonly matChipInputSeparatorKeyCodes: number[] = [ENTER];

  newCommentStub: Comment;
  commentReplyInfo = { replyParentKey: null };
  commentEditInfo = { commentKey: null };

  coverImageFile: File;
  tempCoverImageUploadPath: string;
  coverImageUploadTask: AngularFireUploadTask;
  coverImageUploadPercent$: Observable<number>;
  coverImageUrl$ = new BehaviorSubject<string>(null);

  userMap: UserMap = {};
  userKeys: string[];

  userVotesMap: KeyMap<VoteDirections> = {};

  ckeditorButtonOffset = 0;
  ckeditor = InlineEditor;
  ckeditorConfig = {
    toolbar: {
      items: [
        'heading',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        'blockQuote',
        'imageUpload',
        'mediaEmbed',
        'insertTable'
      ],
      viewportTopOffset: 70
    },
    // fbImageStorage is declared here but set after articleId is set.
    fbImageStorage: {}
  };

  editCoverImage = false;
  editTitle = false;
  editIntro = false;
  editBody = false;
  editTags = false;

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
    body: '',
    imageUrl: '',
    imageAlt: ['', Validators.maxLength(100)],
    authorImageUrl: '',
    lastUpdated: null,
    timestamp: 0,
    lastEditorId: '',
    version: 1,
    commentCount: 0,
    viewCount: 0,
    tags: [[], Validators.maxLength(25)],
    isFeatured: false,
    editors: {},
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private articleSvc: ArticleService,
    private userSvc: UserService,
    private commentSvc: CommentService,
  ) { }

  ngOnInit() {
    //  May abstract userInfo out to an ID now that we have user map...
    this.userSvc.userInfo$.subscribe(user => {
      this.loggedInUser = user;
      this.mapUserVotes();
    });
    this.setArticleId();
    this.subscribeToArticle();
    this.userMap = this.userSvc.userMap;
    this.userKeys = Object.keys(this.userMap);
  }

  ngOnDestroy() {
    this.abortChanges();
    this.currentArticleSubscription.unsubscribe();
  }



  mapUserVotes() {
    this.commentSvc.getUserVotesRef(this.loggedInUser.uid)
      .snapshotChanges().subscribe(snaps => {
        this.userVotesMap = {};
        for (const snap of snaps) {
          this.userVotesMap[snap.key] = snap.payload.val() as any;
        }
      });
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
      this.ckeditorConfig.fbImageStorage = { storageRef: this.articleSvc.createVanillaStorageRef(`articleBodyImages/${this.articleId}/`) };
    });
  }

  subscribeToArticle() {
    if (this.currentArticleSubscription) {
      this.currentArticleSubscription.unsubscribe();
    }
    this.currentArticleSubscription = this.articleSvc
      .getArticleRefById(this.articleId)
      .valueChanges()
      .subscribe(articleData => {
        if (!this.formIsReady) {
          this.setDefaultFormData(articleData);
          this.formIsReady = true;
        } else {
          this.updateCoverImageUrl(articleData.imageUrl);
          this.articleEditForm.patchValue({ lastUpdated: articleData.lastUpdated });
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
      try {
        await this.articleSvc.createArticle(this.loggedInUser, this.articleEditForm.value, this.articleId);
        this.articleIsNew = false;
        this.router.navigate([`article/${this.articleId}`]);
      } catch (error) {
        alert('There was a problem saving the article' + error);
      }
    } else {
      this.articleSvc.updateArticle(this.loggedInUser, this.articleEditForm.value, this.articleId);
    }
    this.resetEditStates();
  }

  resetEditStates() {
    this.articleEditForm.markAsPristine();
    this.tagsEdited = false;
    this.coverImageFile = null;
    this.editCoverImage = false;
    this.editTitle = false;
    this.editIntro = false;
    this.editBody = false;
    this.editTags = false;
  }

  abortChanges() {
    this.currentArticleSubscription.unsubscribe();
    this.cancelUpload(this.coverImageUploadTask);
    if (this.tempCoverImageUploadPath) {
      this.deleteTempCoverImage();
    }
    if (this.articleIsNew) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
  }

  // Form Edit Mode Controls
  toggleEditCoverImage() {
    this.editBody = false;
    this.editCoverImage = !this.editCoverImage;
  }

  toggleEditTitle() {
    this.editBody = false;
    this.editTitle = !this.editTitle;
  }

  toggleEditIntro() {
    this.editBody = false;
    this.editIntro = !this.editIntro;
  }

  toggleEditBody() {
    this.editBody = !this.editBody;
  }

  toggleEditTags() {
    this.editBody = false;
    this.editTags = !this.editTags;
  }

  editorAuthCheck() {
    if (this.loggedInUser.uid) {
      return true;
    } else {
      if (confirm('Login Required: Would you like to login now?')) {
        this.router.navigate(['/login']);
      }
      return false;
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
    if (task) {
      task.cancel();
    }
  }

  updateCoverImageUrl(url) {
    this.articleEditForm.patchValue({ imageUrl: url });
    this.coverImageUrl$.next(url);
  }

  // Article Tagging Functions
  addTag(event: MatChipInputEvent): void {
    const tag = event.value.toUpperCase();
    const isDuplicate = this.checkForDuplicateTag(tag);
    if (tag.trim() && !isDuplicate) {
      this.articleEditForm.value.tags.push(tag.trim());
      event.input.value = '';
      this.tagsEdited = true;
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
      this.tagsEdited = true;
    }
  }

  // Manual Input Validation
  isInvalidTagInput(value) {
    const nonLetterNumberSpace = new RegExp('[^a-zA-Z0-9 ]');
    return nonLetterNumberSpace.test(value) ? true : false;
  }

  articleHasUnsavedChanges(): boolean {
    return this.tagsEdited || !!this.coverImageFile || this.articleEditForm.dirty;
  }

  // CKEditor Button Scroll to Float
  setCkeditorButtonOffset() {
    const viewportTopOffset = this.ckeditorConfig.toolbar.viewportTopOffset;
    const ckeditorTopOffset = viewportTopOffset - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().top;
    const ckeditorBottomOffset = viewportTopOffset + 75 - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().bottom;
    this.ckeditorButtonOffset = ((ckeditorTopOffset >= 0) ? ckeditorTopOffset : 0) - ((ckeditorBottomOffset >= 0) ? ckeditorBottomOffset : 0);
  }

  // Top-Level Commenting Functions
  enterNewCommentMode() {
    this.commentEditInfo.commentKey = null;
    this.newCommentStub = this.commentSvc.createCommentStub(this.loggedInUser.uid, this.articleId, ParentTypes.article);
    this.commentReplyInfo.replyParentKey = this.articleId;
  }

  onCancelNewComment() {
    this.commentReplyInfo.replyParentKey = null;
  }

  onAddComment() {
    this.commentSvc.createComment(this.newCommentStub);
    this.commentReplyInfo.replyParentKey = null;
  }

}

export interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
