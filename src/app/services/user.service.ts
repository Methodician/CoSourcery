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
  rtdb = firebase.database();

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) {
    this.authSvc.authInfo$.subscribe(authInfo => {
      if (authInfo.uid) {
        this.getUserInfo(authInfo.uid).then(info => {
          const userInfo = new UserInfoOpen(
            info.alias,
            info.fName,
            info.lName,
            info.zipCode,
            // Why both $key and uid?
            info.$key = authInfo.uid,
            info.uid,
            info.bio,
            info.city,
            info.state,
            info.imgUrl
          );
          this.userInfo$.next(userInfo);
          this.loggedInUserKey = authInfo.uid;
          // FOR TESTING
          // this.getUsersFollowed('P25y2PMe0SPz2Aitsfg2QSfc0gw2');
          // this.getFollowersOfUser('P25y2PMe0SPz2Aitsfg2QSfc0gw2');
        });
      }
    });

  }



  getUserPresence(userKey) {
    return this.rtdb.ref(`presenceData/users/${userKey}`);
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


  getUserInfo(uid) {
    if (uid) {
      return this.rtdb.ref(`userInfo/open/${uid}`).once(`value`).then(userData => {
        return userData.val();
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
    this.rtdb
      .ref(`userInfo/open/${uid}`)
      .update(detailsToUpdate);
  }

  followUser(userToFollowKey: string) {
    this.rtdb
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${userToFollowKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.rtdb
      .ref(`userInfo/followersPerUser/${userToFollowKey}/${this.loggedInUserKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }

  unfollowUser(userToUnfollowKey: string) {
    this.rtdb
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${userToUnfollowKey}`)
      .remove();
    this.rtdb
      .ref(`userInfo/followersPerUser/${userToUnfollowKey}/${this.loggedInUserKey}`)
      .remove();
  }

  // BETTER (+ error handling)
  getUsersFollowed(uid: string) {
    this.rtdb.ref(`userInfo/usersPerFollower/${uid}`).on('value',
      async users => {
        const usersFollowedList: object[] = new Array<Object>();
        const followed = users.val();
        try {
          for (const key in followed) {
            const user$ = await this.rtdb.ref(`userInfo/open/${key}`).once('value');
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

  getFollowersOfUser(uid: string) {
  firebase.database().ref(`userInfo/followersPerUser/${uid}`).on(`value`, async followers => {
    const followersList: object[] = new Array<Object>();
    const following = followers.val();
    try {
      for (const key in following) {
      const follower$ = await this.rtdb.ref(`userInfo/open/${key}`).once(`value`);
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

  // Still needs work
  isFollowingUser(uid: string) {
    return this.rtdb
      .ref(`userInfo/usersPerFollower/${this.loggedInUserKey}/${uid}`)
      .once('value').then(following => {
        console.log(following);
      });
      // .pipe(map(res => {
      //   return !!res;
      // }));
  }

  updateUser(userInfo, uid) {
    userInfo.uid = null;
    return this.rtdb
      .ref(`userInfo/open/${uid}`)
      .set(userInfo);
  }

  getProfileImageUrl(userKey: string) {
    return this.rtdb.ref(`uploads/profileImages/${userKey}/url`);
  }

  getUserNames() {
    return this.rtdb.ref('userInfo/usernames');
  }
}
