import { UserInfoOpen } from '../shared/class/user-info';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private NULL_USER = new UserInfoOpen(null, null, null, null);
  userInfo$: BehaviorSubject<UserInfoOpen> = new BehaviorSubject<UserInfoOpen>(this.NULL_USER);
  loggedInUserKey: string;
  uid;
  rtdb = firebase.database();

  constructor(
    private authSvc: AuthService,
  ) {
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo.uid) {
        this.getUserInfo(authInfo.uid).then(info => {
          const userInfo = new UserInfoOpen(
            info.alias,
            info.fName,
            info.lName,
            info.zipCode,
            info.uid = authInfo.uid,
            info.bio,
            info.city,
            info.state,
            info.imageUrl
          );
          this.userInfo$.next(userInfo);
          this.loggedInUserKey = authInfo.uid;
        });
      }
    });

  }


  setUserAccess(accessLevel: number, uid: string) {
    return this.rtdb.ref
      (`userInfo/accessLevel/${uid}`)
      .set(accessLevel);
  }

 createUser(userInfo, uid) {
    this.setUserAccess(10, uid);
    return this.rtdb
      .ref(`userInfo/open/${uid}`)
      .set(userInfo);
  }


  async getUserInfo(uid) {
    if (uid) {
      const userRef = await this.rtdb.ref(`userInfo/open/${uid}`).once(`value`);
      const userData = userRef.val();
      return userData;
    }
  }


}
