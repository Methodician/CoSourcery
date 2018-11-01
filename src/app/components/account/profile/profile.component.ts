import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, UploadTracker } from 'app/services/user.service';
import { UserMap, UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'cos-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  userMap: UserMap;
  loggedInUser: UserInfoOpen;

  profileImageFile: File;
  imageUploadTask: AngularFireUploadTask;
  imageUploadPercent$: Observable<number>;
  tempImageUploadPath: string;
  dbUser: UserInfoOpen;

  constructor(
    private userSvc: UserService,
  ) { }

  ngOnInit() {
    this.userSvc.userInfo$.subscribe(user => {
      if (user.uid) {
        // explanation: intending to refactor userService to emit a userId observable, but use the userMap wherever possible instead of the userInfo.
        this.userMap = this.userSvc.userMap;
        this.loggedInUser = this.userMap[user.uid];
        this.dbUser = new UserInfoOpen(user.alias, user.fName, user.lName, user.uid, user.imageUrl, user.email, user.zipCode, user.bio, user.city, user.state);
      }
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

  async onSaveProfileChanges() {
    if (this.profileImageFile) {
      await this.saveProfileImage();
    }
    await this.userSvc.updateUser(this.loggedInUser);
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
    this.loggedInUser.imageUrl = url;
    this.tempImageUploadPath = snap.metadata.fullPath;
    return;
  }

  async saveProfileImage() {
    const tracker = this.userSvc.uploadProfileImage(this.loggedInUser.uid, this.profileImageFile);
    this.imageUploadTask = tracker.task;
    this.imageUploadPercent$ = tracker.task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.loggedInUser.imageUrl = url;
    // this.dbUser.imageUrl = url;
    this.userSvc.trackUploadedProfileImages(this.loggedInUser.uid, snap.metadata.fullPath, url);
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
