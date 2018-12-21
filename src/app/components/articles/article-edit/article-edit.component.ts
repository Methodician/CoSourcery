import { Component, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { ArticleService } from '@services/article.service';
import { UserService } from '@services/user.service';
import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { UserInfoOpen, UserMap } from '@class/user-info';
import { CommentService } from '@services/comment.service';
import { Comment, ParentTypes, KeyMap, VoteDirections } from '@class/comment';
import { EditTimeoutDialogComponent } from '@modals/edit-timeout-dialog/edit-timeout-dialog.component';
import { LoginDialogComponent } from '@modals/login-dialog/login-dialog.component';
import { MessageDialogComponent } from '@modals/message-dialog/message-dialog.component';
import * as exif from 'exif-js';
import { ConfirmDialogComponent } from '@modals/confirm-dialog/confirm-dialog.component';
import * as firebase from 'firebase';
import { BodyImageMeta, ArticleDetail } from '@class/article-info';

@Component({
  selector: 'cos-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})

export class ArticleEditComponent implements OnInit, OnDestroy {
  @ViewChild('ckeditorBoundingBox') ckeditorBoundingBox;
  @ViewChild('formBoundingBox') formBoundingBox;
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
    }
  }
  @HostListener('window:scroll')
  onScroll() {
    this.setCkeditorButtonOffset();
    this.setStickySaveButton();
  }

  loggedInUser: UserInfoOpen = null;

  // Dialog Tracker for Overriding UnsavedChangesGuard
  dialogIsOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Article State
  articleId: any;
  articleIsNew: boolean;
  articleIsBookmarked: boolean;
  articleSubscription: Subscription;
  articleEditorSubscription: Subscription;
  currentArticleEditors = {};
  previousArticleEditors: Array<string>;

  // Article Form State
  formIsInCreateView: boolean;
  articleEditFormSubscription: Subscription;
  editSessionTimeout;
  saveButtonIsSticky = true;

  CtrlNames = CtrlNames; // Enum Availablility in HTML Template
  editCoverImage: boolean = false;
  editTitle: boolean = false;
  editIntro: boolean = false;
  editBody: boolean = false;
  editTags: boolean = false;
  readonly matChipInputSeparatorKeyCodes: number[] = [ENTER];

  coverImageFile: File;
  tempCoverImageUploadPath: string;
  coverImageUploadTask: AngularFireUploadTask;
  coverImageUploadPercent$: Observable<number>;
  coverImageUrl$ = new BehaviorSubject<string>(null);

  articleEditForm: FormGroup = this.fb.group({
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
    body: 'This article is empty.',
    bodyImages: {},
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

  // CKEditor setup
  ckEditorReady = false;
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
    toggleBtnOffset: 0,
  }

  // Top-Level Comments State
  newCommentStub: Comment;
  commentReplyInfo = { replyParentKey: null };
  commentEditInfo = { commentKey: null };
  userMap: UserMap = {};
  userKeys: string[];
  userVotesMap: KeyMap<VoteDirections> = {};

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
    this.watchFormChanges();
    this.watchArticle();
    this.watchUserInfo();
    this.watchCurrentEditors();
  }

  ngOnDestroy() {
    this.articleSubscription.unsubscribe();
    this.articleEditorSubscription.unsubscribe();
    this.articleEditFormSubscription.unsubscribe();
    this.abortChanges();
  }

  // Form Setup & Breakdown
  setArticleId() {
    this.route.params.subscribe(params => {
      if (params['key']) {
        this.articleId = params['key'];
        this.articleIsNew = false;
      } else {
        this.articleId = this.articleSvc.createArticleId();
        this.articleIsNew = true;
        this.formIsInCreateView = true;
      }
      this.ckeditor.config.fbImageStorage = { storageRef: this.articleSvc.createVanillaStorageRef(`articleBodyImages/${this.articleId}/`) };
    });
  }

  watchArticle() {
    this.articleSubscription = this.articleSvc
      .getArticleRefById(this.articleId)
      .valueChanges()
      .subscribe(articleData => {
        this.ckeditor.content = articleData ? articleData.body : this.ckeditor.placeholder;
        this.setFormData(articleData);
        this.mapContributors(articleData);
      });
  }

  mapContributors(articleData: ArticleDetail) {
    this.userSvc.addUserToMap(articleData.authorId);
    const editors = articleData.editors;
    const editorArray = [];
    for (const key in editors) {
      if (articleData.authorId === key) {
        continue;
      }
      this.userSvc.addUserToMap(key);
      editorArray.push({ id: key, editCount: editors[key] });
    }
    editorArray.sort((a, b) => {
      if (a.editCount < b.editCount) {
        return 1;
      }
      if (a.editCount > b.editCount) {
        return -1;
      }
      return 0;
    })
    this.previousArticleEditors = editorArray;
  }

  watchFormChanges() {
    this.articleEditFormSubscription = this.articleEditForm.valueChanges.subscribe(() => {
      if (this.articleEditForm.dirty) {
        this.setEditSessionTimeout();
        if (!this.userIsEditingArticle()) {
          this.addUserEditingStatus();
        }
      }
    });
  }

  setFormData(data) {
    if (data) {
      this.articleEditForm.patchValue(data);
      this.coverImageUrl$.next(data.imageUrl);
    }
  }

  onCKEditorChanged({ event, editor }: ChangeEvent) {
    // We're not using CKEditor as a normal FormControl because its scripts would mark the form as "dirty" even when the data was coming from DB.
    // This approach allows us to manually mark it as dirty only when the changes are local.
    const contents = editor.getData();
    // If onCKEditorReady hasn't run, this will still run with no images to process.
    if (this.ckEditorReady) {
      // setTimeout with 0 delay still pushes this down the stack so we get the updated body.
      // Otherwise when deleting an image, we'll still process the deleted image.
      setTimeout(() => {
        this.processCKEditorImages();
      }, 0);
    }
    this.articleEditForm.markAsDirty();
    this.articleEditForm.patchValue({ body: contents });
  }

  onCKEditorReady($event) {
    this.ckEditorReady = true;
    this.processCKEditorImages();
  }

  // CKEditor image processing (would like to move some of this out side the component)
  processCKEditorImages() {
    const figures = document.getElementsByClassName('image');
    for (let i = 0; i < figures.length; i++) {
      const fig = figures[i];
      const img = fig.firstChild as HTMLImageElement;
      if (img.complete) {
        // Processes images when for one reason or another they are already loaded but may not be rotated.
        this.rotateImage(img);
      } else {
        img.onload = (ev$) => {
          // Processes images when form first loaded
          this.rotateImage(img);
        };
      }
    }
  }

  async rotateImage(img) {
    if (img.src.includes('data:image')) {
      return;
    }
    const storage = firebase.storage();
    const imgPath = storage.refFromURL(img.src).fullPath;
    const imgCode = imgPath.split('/')[imgPath.split('/').length - 1];

    let rotation: orientationDegrees = 0;
    // check if it's been rotated, if so, don't do any extra stuff
    if (img.style.transform && img.style.transform.includes('rotate')) {
      return;
      // check if it's in the map, if so, set rotation via its orientation
    } else if (this.articleEditForm.value.bodyImages[imgCode]) {
      rotation = this.exifOrientationToDegrees(this.articleEditForm.value.bodyImages[imgCode].orientation);
      // else add it to the map with it's correct orientation
    } else {
      let orientation = await this.getExifOrientation(img);
      orientation = orientation ? orientation : 0;
      rotation = this.exifOrientationToDegrees(orientation);

      const imageObject: BodyImageMeta = {
        path: imgPath,
        orientation: orientation,
      };

      this.articleEditForm.value.bodyImages[imgCode] = imageObject;
    }

    img.setAttribute('style', `transform:rotate(${rotation}deg); margin: 80px 0 `);
  }

  getExifOrientation(img): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      try {
        exif.getData(img as any, function () {
          const orientation = exif.getTag(this, 'Orientation');
          return resolve(orientation);
        });
      } catch (error) {
        // console.log('Can\'t get EXIF', error);
        return reject(error);
      }
    });
    return promise;
  }

  exifOrientationToDegrees(orientation): orientationDegrees {
    switch (orientation) {
      case 1:
      case 2:
        return 0;
      case 3:
      case 4:
        return 180;
      case 5:
      case 6:
        return 90;
      case 7:
      case 8:
        return 270;
      default:
        return 0;
    }
  }

  abortChanges() {
    this.cancelUpload(this.coverImageUploadTask);
    if (this.tempCoverImageUploadPath) {
      this.deleteTempCoverImage();
    }
    if (this.articleIsNew) {
      this.articleSvc.deleteArticleRef(this.articleId);
    }
    if (this.articleHasUnsavedChanges()) {
      this.articleSvc.removeArticleEditStatus(this.articleId, this.loggedInUser.uid);
      clearTimeout(this.editSessionTimeout);
    }
  }

  // Cover Image Upload
  async onSelectCoverImage(e: HtmlInputEvent) {
    this.setEditSessionTimeout();
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

  // Article Tagging
  addTag(event: MatChipInputEvent): void {
    const articleTags = this.articleEditForm.value.tags;
    const tag = event.value.toUpperCase();
    const isDuplicate = this.isTagDuplicate(tag);
    if (tag.trim() && !isDuplicate) {
      articleTags.push(tag.trim());
      this.articleEditForm.markAsDirty();
      this.articleEditForm.patchValue({ 'tags': articleTags });
      event.input.value = '';
    }
  }

  isInvalidTagInput(value): boolean {
    const nonLetterNumberSpace = new RegExp('[^a-zA-Z0-9 ]');
    return nonLetterNumberSpace.test(value) ? true : false;
  }

  isTagDuplicate(value): boolean {
    const tagIndex = this.articleEditForm.value.tags.indexOf(value);
    return (tagIndex >= 0) ? true : false;
  }

  removeTag(selectedTag): void {
    const articleTags = this.articleEditForm.value.tags;
    const tagIndex = articleTags.indexOf(selectedTag);
    if (tagIndex >= 0) {
      articleTags.splice(tagIndex, 1);
      this.articleEditForm.markAsDirty();
      this.articleEditForm.patchValue({ 'tags': articleTags });
    }
  }

  // Form Data Handling
  cancelChanges() {
    const response$ = this.openConfirmDialog('Undo Edits', 'Any unsaved changes will be discarded.', 'Are you sure?');
    response$.subscribe(shouldReload => {
      if (shouldReload) {
        this.resetEditStates();
        location.reload();
      }
    });
  }

  async saveChanges() {
    if (this.coverImageFile) {
      await this.saveCoverImage();
      this.deleteTempCoverImage();
      this.coverImageFile = null;
    }
    // Create New Article
    if (!this.articleEditForm.value.articleId) {
      try {
        await this.articleSvc.createArticle(this.loggedInUser, this.articleEditForm.value, this.articleId);
        this.articleIsNew = false;
        clearTimeout(this.editSessionTimeout);
        this.resetEditStates(); // Unsaved changes checked upon route change
        this.router.navigate([`article/${this.articleId}`]);
      } catch (error) {
        this.openMessageDialog('Save Error', 'Oops! There was a problem saving your article.', `Error: ${error}`);
      }
      // Update Existing Article
    } else {
      this.articleSvc.updateArticle(this.loggedInUser, this.articleEditForm.value, this.articleId);
      clearTimeout(this.editSessionTimeout);
      this.resetEditStates();
    }
  }

  resetEditStates() {
    this.articleSvc.removeArticleEditStatus(this.articleId, this.loggedInUser.uid);
    this.currentArticleEditors[this.loggedInUser.uid] = false;
    this.articleEditForm.markAsPristine();
    this.coverImageFile = null;
    this.editCoverImage = false;
    this.editTitle = false;
    this.editIntro = false;
    this.editBody = false;
    this.editTags = false;
  }

  articleHasUnsavedChanges(): boolean {
    return (this.userIsEditingArticle() || !!this.coverImageFile || this.articleEditForm.dirty)
  }

  // Editor and User Info Tracking
  watchUserInfo() {
    //  May abstract userInfo out to an ID now that we have user map...
    this.userSvc.userInfo$.subscribe(user => {
      this.loggedInUser = user;
      this.checkIfBookmarked();
      this.mapUserVotes();
    });
    this.userMap = this.userSvc.userMap;
    this.userKeys = Object.keys(this.userMap);
  }

  watchCurrentEditors() {
    this.articleEditorSubscription = this.articleSvc
      .getEditorsByArticleRef(this.articleId)
      .snapshotChanges()
      .subscribe(snapList => {
        this.currentArticleEditors = {};
        for (const snap of snapList) {
          this.currentArticleEditors[snap.key] = true;
        }
      });
  }

  addUserEditingStatus() {
    this.articleSvc.setArticleEditStatus(this.articleId, this.loggedInUser.uid);
    this.currentArticleEditors[this.loggedInUser.uid] = true;
  }

  articleHasEditors(): boolean {
    return Object.keys(this.currentArticleEditors).length > 0;
  }

  userIsEditingArticle(): boolean {
    return !!this.currentArticleEditors[this.loggedInUser.uid];
  }

  // Editor Session Management
  setEditSessionTimeout() {
    clearTimeout(this.editSessionTimeout);
    this.editSessionTimeout = setTimeout(() => {
      this.openTimeoutDialog();
    }, 300000);
  }

  openTimeoutDialog() {
    this.dialogIsOpen.next(true);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(EditTimeoutDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(res => {
      this.dialogIsOpen.next(false);
      const editorIsActive = res ? res : false;
      if (editorIsActive) {
        this.setEditSessionTimeout();
      } else {
        this.endEditSession();
      }
    });
  }

  endEditSession() {
    this.dialogIsOpen.next(true);
    const dialogRef = this.openMessageDialog('Session Timeout', 'Your changes have been discarded.');
    dialogRef.afterClosed().subscribe(() => {
      this.dialogIsOpen.next(false);
      this.resetEditStates();
      this.router.navigate(['home']);
    });
  }

  // UI Display
  async toggleEditControl(ctrlName: CtrlNames) {
    // For now doesn't allow multiple editors. Will change later...
    if (!this.userIsEditingArticle() && this.articleHasEditors()) {
      const uid = Object.keys(this.currentArticleEditors)[0];
      // Editors is an array so that we can later allow multilple collaborative editors.
      if (!this.userMap[uid]) {
        await this.userSvc.addUserToMap(uid);
      }
      this.openMessageDialog('Edit Locked', `The user "${this.userMap[uid].displayName()}" is currently editing this article.`, 'Please try again later.');
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
          break;
        default:
          break;
      }
    }
  }

  authCheck(): boolean {
    if (this.loggedInUser.uid) {
      return true;
    } else {
      this.dialog.open(LoginDialogComponent);
      return false;
    }
  }

  setCkeditorButtonOffset() {
    const viewportTopOffset = this.ckeditor.config.toolbar.viewportTopOffset;
    const ckeditorTopOffset = viewportTopOffset - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().top;
    const ckeditorBottomOffset = viewportTopOffset + 75 - this.ckeditorBoundingBox.nativeElement.getBoundingClientRect().bottom;
    this.ckeditor.toggleBtnOffset = ((ckeditorTopOffset >= 0) ? ckeditorTopOffset : 0) - ((ckeditorBottomOffset >= 0) ? ckeditorBottomOffset : 0);
  }

  setStickySaveButton() {
    const formBottomOffset = this.formBoundingBox.nativeElement.getBoundingClientRect().bottom;
    const verticalOverflow = formBottomOffset - window.innerHeight;
    this.saveButtonIsSticky = (verticalOverflow > 0) ? true : false;
  }

  // Bookmarking
  checkIfBookmarked() {
    const ref = this.articleSvc.bookmarkedRef(this.loggedInUser.uid, this.articleId);
    ref.valueChanges().subscribe(snapshot => {
      if (snapshot && snapshot.toString().length === 13) {
        this.articleIsBookmarked = true;
      } else {
        this.articleIsBookmarked = false;
      }
    });
  }

  bookmarkToggle() {
    if (this.authCheck()) {
      if (this.articleIsBookmarked) {
        this.articleSvc.unBookmarkArticle(this.loggedInUser.uid, this.articleId);
      } else {
        this.articleSvc.bookmarkArticle(this.loggedInUser.uid, this.articleId);
      }
    }
  }

  // Top-Level Commenting
  mapUserVotes() {
    this.commentSvc.getUserVotesRef(this.loggedInUser.uid)
      .snapshotChanges().subscribe(snaps => {
        this.userVotesMap = {};
        for (const snap of snaps) {
          this.userVotesMap[snap.key] = snap.payload.val() as any;
        }
      });
  }

  enterNewCommentMode() {
    this.commentEditInfo.commentKey = null;
    this.newCommentStub = this.commentSvc.createCommentStub(this.loggedInUser.uid, this.articleId, ParentTypes.article);
    this.commentReplyInfo.replyParentKey = this.articleId;
  }

  onAddComment() {
    this.commentSvc.createComment(this.newCommentStub);
    this.commentReplyInfo.replyParentKey = null;
  }

  onCancelNewComment() {
    this.commentReplyInfo.replyParentKey = null;
  }

  // Dialog Helpers
  openMessageDialog(title: string, msg1: string, msg2: string = null) {
    const dialogConfig = this.genericDialogConfig(title, msg1, msg2);
    return this.dialog.open(MessageDialogComponent, dialogConfig);
  }

  openConfirmDialog(title: string, msg1: string, msg2: string = null): Observable<boolean> {
    const dialogConfig = this.genericDialogConfig(title, msg1, msg2);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  genericDialogConfig(title: string, msg1: string, msg2: string = null): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      dialogTitle: title ? title : null,
      dialogLine1: msg1 ? msg1 : null,
      dialogLine2: msg2 ? msg2 : null
    }

    return dialogConfig;
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

// possible remove
export type orientationDegrees = 0 | 90 | 180 | 270;
