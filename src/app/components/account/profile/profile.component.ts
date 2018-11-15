import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  profileForm: FormGroup;
  userMap: UserMap;
  loggedInUserId = null;
  // varible only used if the logged in UID isn't the same as the UID in the url.
  readOnlyUserInfo: UserInfoOpen;
  isLoggedInUsersProfile: boolean;
  profileKey: string;

  profileImageFile: File;
  imageUploadTask: AngularFireUploadTask;
  imageUploadPercent$: Observable<number>;
  tempImageUploadPath: string;
  dbUser: UserInfoOpen;

  constructor(
    private userSvc: UserService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    this.profileForm = this.fb.group({
      alias: ['', Validators.maxLength(30)],
      fName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      lName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      uid: ['', Validators.required],
      imageUrl: '',
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]],
      zipCode: ['', Validators.maxLength(5)],
      bio: ['', Validators.maxLength(500)],
      city: ['', Validators.maxLength(30)],
      state: ['', Validators.maxLength(2)],
    });
  }

  // break up this ngOnInit into smaller functions
  ngOnInit() {
    this._route.params.subscribe((params: Params) => {
      this.profileKey = params['key'];
      this.isLoggedInUsersProfile = this.checkProfileOwnership();
      console.log('isLoggedInUsersProfile', this.isLoggedInUsersProfile);

      this.userSvc.userInfo$.subscribe(user => {
        if (user.uid) {
          // explanation: intending to refactor userService to emit a userId observable, but use the userMap wherever possible instead of the userInfo.
          this.userMap = this.userSvc.userMap;
          this.loggedInUserId = user.uid;
          // checks to see if uid in the url is same as logged in user's id i.e. the logged in users profile.
          if (this.isLoggedInUsersProfile) {
            this.dbUser = new UserInfoOpen(user.alias, user.fName, user.lName, user.uid, user.imageUrl, user.email, user.zipCode, user.bio, user.city, user.state);
            this.profileForm.patchValue(this.userMap[user.uid]);
          } else {
            // get user info of the user that isn't currently logged in.
            // this could be redundant and maybe with some refactoring only one call to the userSvc would be neccessary.
            this.getUserInfo();
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

  getUserInfo() {
    console.log('profileKey:', this.profileKey);
    console.log('this.userSvc.userInfo$:', this.userSvc.userInfo$);
    console.log('user map:', this.userMap);
    console.log('user map in service:', this.userSvc.userMap);
    this.userSvc.getUserInfo(this.profileKey).then((data) => {
      console.log(data);
      this.readOnlyUserInfo = data;
    });
  }

  checkProfileOwnership(): any {
    if (this.profileKey === this.loggedInUserId || !this.profileKey) {
      return true;
    } else {
      return false;
    }
  }

  async onSaveProfileChanges() {
    if (this.profileImageFile) {
      await this.saveProfileImage();
    }
    await this.userSvc.updateUser(this.profileForm.value);
    this.profileForm.markAsPristine();
  }
  // Cover Image Upload Functions
  async onSelectProfileImage(e: HtmlInputEvent) {
    if (this.profileImageFile) {
      this.userSvc.deleteFile(this.tempImageUploadPath);
    }
    this.profileImageFile = e.target.files.item(0);
    const tracker = this.userSvc.uploadTempImage(this.profileImageFile);
    this.imageUploadTask = tracker.task;
    this.imageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.profileForm.patchValue({ imageUrl: url });
    this.profileForm.markAsDirty();
    this.tempImageUploadPath = snap.metadata.fullPath;
    return;
  }

  async saveProfileImage() {
    const tracker = this.userSvc.uploadProfileImage(this.loggedInUserId, this.profileImageFile);
    this.imageUploadTask = tracker.task;
    this.imageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.profileForm.patchValue({ imageUrl: url });
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

  trimInput(formControlName) {
    this.profileForm.patchValue(
      { [formControlName]: this.profileForm.value[formControlName].trim() }
    );
  }
}

export interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
