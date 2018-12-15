import { UserInfoOpen, UserMap } from '@class/user-info';
import { AuthService } from '@services/auth.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private NULL_USER = new UserInfoOpen(null, null, null, null);
  userInfo$: BehaviorSubject<UserInfoOpen> = new BehaviorSubject<UserInfoOpen>(this.NULL_USER);
  // rtdb = firebase.database();
  userMap: UserMap = {};

  constructor(
    private authSvc: AuthService,
    private storage: AngularFireStorage,
    private rtdb: AngularFireDatabase,
    private fsdb: AngularFirestore
  ) {
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo.uid) {
        this.userInfoRef(authInfo.uid)
          .valueChanges()
          .subscribe(info => {
            const userInfo = new UserInfoOpen(
              info.alias,
              info.fName,
              info.lName,
              authInfo.uid,
              info.imageUrl,
              info.email,
              info.zipCode,
              info.bio,
              info.city,
              info.state,
            );
            this.userMap[authInfo.uid] = userInfo;
            this.userInfo$.next(userInfo);
          });
      } else {
        this.userInfo$.next(this.NULL_USER);
      }
    });

  }

  uploadTempImage(file: File): UploadTracker {
    const id = this.fsdb.createId();
    const storageRef = this.storage.ref(`tempImages/${id}`);
    const task = storageRef.put(file);
    return { task: task, ref: storageRef };
  }

  deleteFile(path: string) {
    const storageRef = this.storage.ref(path);
    storageRef.delete().subscribe(res => {
      // console.log('DELETED TEMP IMAGE (maybe), result: ', res);
    });
  }

  uploadProfileImage(uid: string, file: File): UploadTracker {
    const storageRef = this.storage.ref(`profileImages/${uid}`);
    const task = storageRef.put(file);
    return { task: task, ref: storageRef };
  }

  trackUploadedProfileImages(uid, fullPath, url) {
    const docRef = this.fsdb.doc(`fileUploads/profileUploads/profileImages/${uid}`);
    docRef.set({ path: fullPath, downloadUrl: url });
  }

  setUserAccess(accessLevel: number, uid: string) {
    return this.rtdb
      .object(`userInfo/accessLevel/${uid}`)
      .set(accessLevel);
  }

  createUser(userInfo, uid) {
    this.setUserAccess(10, uid);
    return this.rtdb
      .object(`userInfo/open/${uid}`)
      .set(userInfo);
  }

  updateUser(userInfo) {
    return this.rtdb
      .object(`userInfo/open/${userInfo.uid}`)
      .update(userInfo);
  }

  userInfoRef(uid: string): AngularFireObject<UserInfoOpen> {
    return this.rtdb.object(`userInfo/open/${uid}`);
  }

  async getUserInfo(uid) {
    if (uid) {
      const userRef = await this.rtdb.object(`userInfo/open/${uid}`).query.once(`value`);
      const userData = userRef.val();
      return userData;
    }
  }

  async addUserToMap(userId) {
    const userData = await this.getUserInfo(userId);
    const { alias, fName, lName, uid, imageUrl, email, zipCode, bio, city, state } = userData;
    const userInfo = new UserInfoOpen(alias, fName, lName, uid, imageUrl, email, zipCode, bio, city, state);
    this.userMap[userId] = userInfo;
  }

}

export interface UploadTracker {
  task: AngularFireUploadTask;
  ref: AngularFireStorageReference;
}
