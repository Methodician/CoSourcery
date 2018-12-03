import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UserService, UploadTracker } from 'app/services/user.service';
import { UserMap, UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from 'app/services/article.service';
import { ArticlePreview } from 'app/shared/class/article-info';

@Component({
  selector: 'cos-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('formComponent') formComponent;
  userMap: UserMap;
  dbUser: UserInfoOpen;
  profileId: string;
  loggedInUserId = null;
  profileImageFile: File;
  imageUploadTask: AngularFireUploadTask;
  imageUploadPercent$: Observable<number>;
  tempImageUploadPath: string;
  editMode: boolean;
  authoredArticles: ArticlePreview[];
  editedArticles: ArticlePreview[];

  constructor(
    private userSvc: UserService,
    private articleSvc: ArticleService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this._route.params.subscribe((params: Params) => {
      this.userSvc.userInfo$.subscribe(user => {
        if (user.uid) {
          // explanation: intending to refactor userService to emit a userId observable, but use the userMap wherever possible instead of the userInfo.
          this.userMap = this.userSvc.userMap;
          this.loggedInUserId = user.uid;
          if (!params['key']) { // is this the best way to achieve this? Is there some way to do this in routing where it seems more appropriate.
            this.editMode = true;
            this.dbUser = new UserInfoOpen(user.alias, user.fName, user.lName, user.uid, user.imageUrl, user.email, user.zipCode, user.bio, user.city, user.state);
            this.profileId = this.loggedInUserId;
          } else {
            this.editMode = false;
            this.profileId = params['key'];
            if (!this.userMap[this.profileId]) {
              this.userSvc.addUserToMap(this.profileId);
            }
            this.setDisplayInfo(this.profileId);
          }
        } else {
          this.loggedInUserId = null;
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.dbUser) {
      this.userMap[this.dbUser.uid] = new UserInfoOpen(this.dbUser.alias, this.dbUser.fName, this.dbUser.lName, this.dbUser.uid, this.dbUser.imageUrl, this.dbUser.email, this.dbUser.zipCode, this.dbUser.bio, this.dbUser.city, this.dbUser.state);
    }
    if (this.imageUploadTask) {
      this.cancelUpload(this.imageUploadTask);
    }
    if (this.tempImageUploadPath) {
      this.userSvc.deleteFile(this.tempImageUploadPath);
    }
  }

  // +_+++++++++++++++++++++++++++

  getAuthoredArticlesById(authorId: string) {
    this.authoredArticles = [];

    this.articleSvc.getArticleRefsByAuthor(authorId).get().subscribe(articles => {
      console.log('authored articles count: ', articles.docs.length);
      articles.docs.forEach(art => {
        const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
        preview$.subscribe(artPrev => {
          this.authoredArticles.push(artPrev);
        });
      });
    });
  }

  getEditedArticlesById(editorId: string) {
    this.editedArticles = [];

    this.articleSvc.getArticlesRefsByEditor(editorId).get().subscribe(articles => {
      console.log('authored articles count: ', articles.docs.length);
      articles.docs.forEach(art => {
        const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
        preview$.subscribe(artPrev => {
          this.editedArticles.push(artPrev);
        });
      });
    });
  }

  setDisplayInfo(profileId) {
    this.getAuthoredArticlesById(profileId);
    this.getEditedArticlesById(profileId);
  }

  // +_+++++++++++++++++++++++++++

  edit() {
    this._router.navigate(['profile']);
  }

  async onSaveProfileChanges() {
    if (this.profileImageFile) {
      await this.saveProfileImage();
    }
    await this.userSvc.updateUser(this.formComponent.user);
    this.formComponent.profileForm.markAsPristine();
  }

  // Cover Image Upload Functions
  async onSelectProfileImage(e: HtmlInputEvent) {
    const profileForm = this.formComponent.profileForm;
    if (this.profileImageFile) {
      this.userSvc.deleteFile(this.tempImageUploadPath);
    }
    this.profileImageFile = e.target.files.item(0);
    const tracker = this.userSvc.uploadTempImage(this.profileImageFile);
    this.imageUploadTask = tracker.task;
    this.imageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    profileForm.patchValue({ imageUrl: url });
    profileForm.markAsDirty();
    this.tempImageUploadPath = snap.metadata.fullPath;
    return;
  }

  async saveProfileImage() {
    const tracker = this.userSvc.uploadProfileImage(this.loggedInUserId, this.profileImageFile);
    this.imageUploadTask = tracker.task;
    this.imageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.formComponent.profileForm.patchValue({ imageUrl: url });
    // this.dbUser.imageUrl = url;
    this.userSvc.trackUploadedProfileImages(this.loggedInUserId, snap.metadata.fullPath, url);
    this.userSvc.deleteFile(this.tempImageUploadPath);
    return;
  }

  cancelUpload(task: AngularFireUploadTask) {
    if (task) {
      task.cancel();
    }
  }
}

export interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
