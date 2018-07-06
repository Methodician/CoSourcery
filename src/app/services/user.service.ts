import { UserInfoOpen } from '../shared/class/user-info';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, mergeMap, combineLatest } from 'rxjs/operators';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MapOperator } from 'rxjs/internal/operators/map';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private NULL_USER = new UserInfoOpen(null, null, null, null);
  userInfo$: BehaviorSubject<UserInfoOpen> = new BehaviorSubject<UserInfoOpen>(this.NULL_USER);
  loggedInUserKey: string;
  uid;
  db;
  test;

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) {
    this.authSvc.authInfo.subscribe(authInfo => {
      if (authInfo.uid) {
        this.getUserInfo(authInfo.uid).then(info => {
          const userInfo = new UserInfoOpen(
            info.alias,
            info.fName,
            info.lName,
            info.zipCode,
            info.$key = authInfo.uid,
            info.uid,
            info.bio,
            info.city,
            info.state
          );
          this.userInfo$.next(userInfo);
          this.loggedInUserKey = authInfo.uid;
          this.getUsersFollowed('P25y2PMe0SPz2Aitsfg2QSfc0gw2');
          this.getFollowersOfUser('P25y2PMe0SPz2Aitsfg2QSfc0gw2');
        });
        this.db = firebase.database();
      }
    });

  }



  getUserPresence(userKey) {
    return this.db.ref(`presenceData/users/${userKey}`);
  }

  setUserAccess(accessLevel: number, uid: string) {
    return this.db.ref
      (`userInfo/accessLevel/${uid}`)
      .set(accessLevel);
  }

  createUser(userInfo, uid) {
    this.setUserAccess(10, uid);
    return this.db
      .ref(`userInfo/open/${uid}`)
      .set(userInfo);
  }


  getUserInfo(uid) {
    if (uid) {
      return firebase.database().ref(`userInfo/open/${uid}`).once(`value`).then(data => {
        return data.val();
      });
    }
  }

  updateUserInfo(userInfo, uid) {
    const detailsToUpdate = {
      alias: userInfo.alias,
      bio: userInfo.bio,
      city: userInfo.city,
      email: userInfo.email,
      fName: userInfo.fName,
      lName: userInfo.lName,
      state: userInfo.state,
      zipCode: userInfo.zipCode
    };
    this.db
      .ref(`userInfo/open/${uid}`)
      .update(detailsToUpdate);
  }

  followUser(userToFollowKey: string) {
    this.db
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${userToFollowKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.db
      .ref(`userInfo/followersPerUser/${userToFollowKey}/${this.loggedInUserKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }

  unfollowUser(userToUnfollowKey: string) {
    this.db
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${userToUnfollowKey}`)
      .remove();
    this.db
      .ref(`userInfo/followersPerUser/${userToUnfollowKey}/${this.loggedInUserKey}`)
      .remove();
  }

  // BETTER (+ error handling)
  getUsersFollowed(uid: string) {
    firebase.database().ref(`userInfo/usersPerFollower/${uid}`).on('value',
      async users => {
        const usersFollowedList: object[] = new Array<Object>();
        const followed = users.val();
        try {
          for (const key in followed) {
            const user$ = await this.db.ref(`userInfo/open/${key}`).once('value');
            const user = user$.val();
            user.uid = key;
            usersFollowedList.push(user);
          }
          return usersFollowedList;
        } catch (err) {
          console.log('an error in async', err);
        }
      },
      err => {
        console.log('there was an in the callback', err);
      });
  }

  getFollowersOfUser(uid: string) { // : Observable<UserInfoOpen[]>
  firebase.database().ref(`userInfo/followersPerUser/${uid}`).on(`value`, async followers => {
    const followersList: object[] = new Array<Object>();
    const following = followers.val();
    try {
      for (const key in following) {
      const follower$ = await this.db.ref(`userInfo/open/${key}`).once(`value`);
      const follower = follower$.val();
      follower.uid = key;
      followersList.push(follower);
      }
      return followersList;
    } catch (err) {
      console.log('an error in async', err);
    }
  },
    err => {
      console.log(`there was an error in the callback`, err);
    });
}

  navigateToProfile(uid: any) {
    this.router.navigate([`profile/${uid}`]);
  }

  isFollowingUser(uid: string) {
    return this.db
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${uid}`)
      .valueChanges()
      .pipe(map(res => {
        return !!res;
      }));
  }

  updateUser(userInfo, uid) {
    userInfo.uid = null;
    return this.db
      .ref(`userInfo/open/${uid}`)
      .set(userInfo);
  }

  getProfileImageUrl(userKey: string) {
    return this.db.ref(`uploads/profileImages/${userKey}/url`);
  }

  getUserNames() {
    return this.db.ref('userInfo/usernames');
  }

  // injectObjectKey(object) {
    //   return object
    //   .snapshotChanges()
    //     .pipe(map(element => {
    //       return {
    //         $key: element.key,
    //         ...element.payload.val()
    //       };
    //     }));
    //   return object;

  // }

  // injectListKeys(list) {
  //   return list
  //     .snapshotChanges()
  //     .pipe(map((elements: any) => {
  //       return elements.map(element => {
  //         return {
  //           $key: element.key,
  //           ...element.payload.val()
  //         };
  //       });
  //     }));
  // }

  /*isAdmin() {
    let sub = new Subject();
    this.authSvc.authInfo$.subscribe(info => {
      if (info.$uid) {
        this.db.object(`userInfo/accessLevel/${info.$uid}`).subscribe(accessLevel => {
          sub.next(accessLevel.$value >= 80);
          sub.complete();
        });
      }
    });
    return sub.asObservable();
  }*/

}