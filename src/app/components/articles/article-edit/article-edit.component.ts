import { Component, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent, MatDialog } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { UserInfoOpen, UserMap } from 'app/shared/class/user-info';
import { CommentService } from 'app/services/comment.service';
import { Comment, ParentTypes, KeyMap, VoteDirections } from 'app/shared/class/comment';
import { EditTimeoutDialogComponent } from '../../modals/edit-timeout-dialog/edit-timeout-dialog.component';
import { LoginDialogComponent } from '../../modals/login-dialog/login-dialog.component';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  // This makes the enum available in the HTML Template
  CtrlNames = CtrlNames;

  loggedInUser: UserInfoOpen = null;
  isArticleBookmarked: boolean;
  articleId: any;
  articleIsNew: boolean;
  currentArticleEditors = {};
  isEditingInterval;
  responseTimer;
  dialogRef;
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

  ckeditor = {
    build: InlineEditor,
    config: {
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
    },
    placeholder: '<h2>Creating a New Article</h2><ol><li>Add an eye-catching <strong>Cover Image</strong> above.</li><li>Choose a concise, meaningful, and interesting <strong>Title</strong>.</li><li>Write a brief <strong>Intro</strong> to outline the topic of your article and why it\'s so cool!</li><li>Add the <strong>Body</strong> of your article by editing this block of content.</li><li>Add some <strong>Tags</strong> below to help people find your article.</li><li>Click <strong>Save Article</strong> when you\'re done.</li></ol>',
    content: null,
    toggleBtnOffset: 0
  }

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

  @ViewChild('ckeditorBoundingBox') ckeditorBoundingBox;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.articleHasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
  @HostListener('window:keydown', ['$event'])
  onkeydown($event: any) {
    if (this.userIsEditingArticle()) {
      if ($event.ctrlKey && $event.code === 'KeyS') {
        $event.preventDefault();
        this.saveChanges();
      }
      this.resetIsEditingInterval();
    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private articleSvc: ArticleService,
    private userSvc: UserService,
    private commentSvc: CommentService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.setArticleId();
    //  May abstract userInfo out to an ID now that we have user map...
    this.userSvc.userInfo$.subscribe(user => {
      this.loggedInUser = user;
      this.checkIfBookmarked();
      this.mapUserVotes();
    });
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
        this.subscribeToCurrentEditors();
      } else {
        this.articleId = this.articleSvc.createArticleId();
        this.articleIsNew = true;
        this.subscribeToCurrentEditors();
      }
      this.ckeditor.config.fbImageStorage = { storageRef: this.articleSvc.createVanillaStorageRef(`articleBodyImages/${this.articleId}/`) };
    });
  }

  checkIfBookmarked() {
    const ref = this.articleSvc.bookmarkedRef(this.loggedInUser.uid, this.articleId);
    ref.valueChanges().subscribe(snapshot => {
      if (snapshot && snapshot.toString().length === 13) {
        this.isArticleBookmarked = true;
      } else {
        this.isArticleBookmarked = false;
      }
    });
  }

  subscribeToCurrentEditors() {
    this.articleSvc
      .getEditorsByArticleRef(this.articleId)
      .snapshotChanges()
      .subscribe(snapList => {
        this.currentArticleEditors = {};
        for (let snap of snapList) {
          this.currentArticleEditors[snap.key] = true;
        }
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
        this.ckeditor.content = articleData ? articleData.body : this.ckeditor.placeholder;
        this.setFormData(articleData);
      });
  }

  setFormData(data) {
    if (!this.articleIsNew) {
      this.articleEditForm.patchValue(data);
      this.coverImageUrl$.next(data.imageUrl);
    }
    this.articleEditForm.valueChanges.subscribe(() => {
      if (this.articleEditForm.dirty && !this.userIsEditingArticle()) {
        this.addUserEditingStatus();
      }
    });
  }

  onCKEditorChanged({ event, editor }: ChangeEvent) {
    // We're not using CKEditor as a normal FormControl because its scripts would mark the form as "dirty" even when the data was coming from DB.
    // This approach allows us to manually mark it as dirty only when the changes are coming from locally...
    const contents = editor.getData();
    this.articleEditForm.markAsDirty();
    this.articleEditForm.patchValue({ body: contents });
  }

  addUserEditingStatus() {
    this.articleSvc.setArticleEditStatus(this.articleId, this.loggedInUser.uid);
    this.currentArticleEditors[this.loggedInUser.uid] = true;
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
    clearInterval(this.isEditingInterval);
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
    this.articleSvc.removeArticleEditStatus(this.articleId, this.loggedInUser.uid);
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
    if (this.articleHasUnsavedChanges()) {
      this.articleSvc.removeArticleEditStatus(this.articleId, this.loggedInUser.uid);
      clearInterval(this.isEditingInterval);
    }
  }

  // Toggle Controls
  bookmarkToggle() {
    if (this.authCheck()) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.loggedInUser.uid, this.articleId);
      } else {
        this.articleSvc.bookmarkArticle(this.loggedInUser.uid, this.articleId);
      }
    }
  }

  toggleEditControl(ctrlName: CtrlNames) {
    // For now doesn't allow multiple editors. Will change later...
    if (!this.userIsEditingArticle() && this.articleHasEditors()) {
      alert('Another user is currently editing this article. Try again later.');
    } else if (this.authCheck()) {
      if (ctrlName !== CtrlNames.body) {
        this.editBody = false;
      }
      switch (ctrlName) {
        case CtrlNames.coverImage:
          this.editCoverImage = !this.editCoverImage;
          break;
        case CtrlNames.title:
          this.editTitle = !this.editTitle;
          break;
        case CtrlNames.intro:
          this.editIntro = !this.editIntro;
          break;
        case CtrlNames.tags:
          this.editTags = !this.editTags;
          break;
        case CtrlNames.body:
          this.editBody = !this.editBody;
        default:
          break;
      }
    }
  }

  authCheck() {
    if (this.loggedInUser.uid) {
      return true;
    } else {
      this.dialog.open(LoginDialogComponent);
      return false;
    }
  }

  // Cover Image Upload Functions
  async onSelectCoverImage(e: HtmlInputEvent) {
    this.resetIsEditingInterval();
    this.coverImageFile = e.target.files.item(0);
    const tracker = this.articleSvc.uploadTempImage(this.coverImageFile);
    this.coverImageUploadTask = tracker.task;
    this.coverImageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.coverImageUrl$.next(url);
    this.tempCoverImageUploadPath = snap.metadata.fullPath;
    this.addUserEditingStatus();
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
      this.addUserEditingStatus();
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
      this.addUserEditingStatus();
      this.tagsEdited = true;
    }
  }

  // Manual Input Validation
  isInvalidTagInput(value) {
    const nonLetterNumberSpace = new RegExp('[^a-zA-Z0-9 ]');
    return nonLetterNumberSpace.test(value) ? true : false;
  }

  articleHasEditors() {
    return Object.keys(this.currentArticleEditors).length > 0;
  }

  userIsEditingArticle() {
    return this.currentArticleEditors[this.loggedInUser.uid];
  }

  articleHasUnsavedChanges(): boolean {
    return (this.userIsEditingArticle() || this.tagsEdited || !!this.coverImageFile || this.articleEditForm.dirty)
  }

  resetIsEditingInterval() {
    clearInterval(this.isEditingInterval);
    this.isEditingInterval = setInterval(() => {
      this.checkStillEditing();
    }, 240000);
  }

  checkStillEditing() {
    this.openDialog();
    this.responseTimer = setTimeout(() => {
      this.dialogRef.close();
    }, 45000);
  }

  endEditing() {
    clearInterval(this.isEditingInterval);
    this.resetEditStates();
    this.router.navigate(['home']);
    alert('Your editing session has ended');
  }

  openDialog() {
    this.dialogRef = this.dialog.open(EditTimeoutDialogComponent, {
      width: '250px',
      data: { editing: false }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        clearTimeout(this.responseTimer);
        const editing = result.editing;
        if (!editing) {
          this.endEditing();
        }
      } else {
        this.endEditing();
      }
    });
  }

  // CKEditor Button Scroll to Float
  setCkeditorButtonOffset() {
    const viewportTopOffset = this.ckeditor.config.toolbar.viewportTopOffset;
    const ckeditorTopOffset = viewportTopOffset - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().top;
    const ckeditorBottomOffset = viewportTopOffset + 75 - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().bottom;
    this.ckeditor.toggleBtnOffset = ((ckeditorTopOffset >= 0) ? ckeditorTopOffset : 0) - ((ckeditorBottomOffset >= 0) ? ckeditorBottomOffset : 0);
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

export enum CtrlNames {
  coverImage = 'coverImage',
  title = 'title',
  intro = 'intro',
  body = 'body',
  tags = 'tags'
}
