import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UserService, UploadTracker } from 'app/services/user.service';
import { UserMap, UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Params, ActivatedRoute } from '@angular/router';

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

  constructor(
    private userSvc: UserService,
    private _route: ActivatedRoute,
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
            this.profileId = this.loggedInUserId;
          } else {
            this.editMode = false;
            this.profileId = params['key'];
            if (!this.userMap[this.profileId]) {
              this.userSvc.addUserToMap(this.profileId);
            }
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

  // not using this yet. just staging for the future implemention of the read only component.
  editButton() {
    const user = this.userMap[this.loggedInUserId];
    this.dbUser = new UserInfoOpen(user.alias, user.fName, user.lName, user.uid, user.imageUrl, user.email, user.zipCode, user.bio, user.city, user.state);

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
