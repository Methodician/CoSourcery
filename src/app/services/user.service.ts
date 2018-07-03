import { UserInfoOpen } from '../shared/class/user-info';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, mergeMap, combineLatest } from 'rxjs/operators';
import * as firebase from 'firebase';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private NULL_USER = new UserInfoOpen(null, null, null, null)
  userInfo$: BehaviorSubject<UserInfoOpen> = new BehaviorSubject<UserInfoOpen>(this.NULL_USER);
  loggedInUserKey: string;
  uid;
  db;

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) {
    this.authSvc.authInfo.subscribe(authInfo => {
      if (authInfo.uid ){
       this.getUserInfo(authInfo.uid).then(info => {
        const userInfo = new UserInfoOpen(
          info.alias,
          info.fName,
          info.lName,
          info.zipCode,
          info.$key,
          info.uid,
          info.bio,
          info.city,
          info.state
        )
        this.userInfo$.next(userInfo);
        this.loggedInUserKey = authInfo.uid;
        })
    this.db = firebase.database();
    }
  })
  
}



  getUserPresence(userKey) {
    return this.db.ref(`presenceData/users/${userKey}`);
    // return this.rtdb.object(`presenceData/users/${userKey}`);
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

  getUserList() {
    return this.injectListKeys(firebase.database().ref('userInfo/open'));
  }

  getUserInfo(uid) {
    if (uid){
      const object = firebase.database().ref(`userInfo/open/${uid}`).once(`value`).then(data => {
        return data.val();
      })  
      this.getUsersFollowed('P25y2PMe0SPz2Aitsfg2QSfc0gw2');
      return object;
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
    }
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

  // UserArrayFromKeyArray(userKeys: Observable<string[]>): Observable<UserInfoOpen[]> {
  //   return userKeys
  //     .pipe(map(usersPerKey => {
  //       return usersPerKey.map((keyUser: any) => {
  //         const userRef = this.db.ref(`userInfo/open/${keyUser.$key}`);
  //         console.log('userRef', userRef);
          
  //         const object = this.injectObjectKey(userRef);
  //         return object.pipe(map((user: any) => {
  //             return new UserInfoOpen(
  //               user.alias,
  //               user.fName,
  //               user.lName,
  //               user.zipCode,
  //               user.$key,
  //               user.$key,
  //               user.bio,
  //               user.city,
  //               user.state
  //             );
  //           }))
  //       })
  //     }),
  //       mergeMap((firebaseObjects: any) => {
  //         return firebaseObjects.pipe(val => combineLatest(val));
  //         // return combineLatest(firebaseObjects);
  //       }));
  //   // .flatMap(firebaseObjects => {
  //   //   return Observable.combineLatest(firebaseObjects)
  //   // });
  // }

  UserArrayFromKeyArray(userKeys: Observable<string[]>): Observable<UserInfoOpen[]> {
    return userKeys.forEach(key => {})




      .pipe(map(usersPerKey => {
        return usersPerKey.map((keyUser: any) => {
          const userRef = this.db.ref(`userInfo/open/${keyUser.$key}`);
          console.log('userRef', userRef);
          
          const object = this.injectObjectKey(userRef);
          return object.pipe(map((user: any) => {
              return new UserInfoOpen(
                user.alias,
                user.fName,
                user.lName,
                user.zipCode,
                user.$key,
                user.$key,
                user.bio,
                user.city,
                user.state
              );
            }))
        })
      }),


    )}

  getUsersFollowed(uid: string): Observable<UserInfoOpen[]> {
    const usersFollowedKeysList = firebase.database().ref(`userInfo/usersPerFollower/${uid}`).once(`value`).then(userList => {

     return userList.val();
    })    
    const usersFollowedObservable = this.UserArrayFromKeyArray(usersFollowedKeysList as any);
    return usersFollowedObservable;
  }

  getFollowersOfUser(uid: string): Observable<UserInfoOpen[]> {
    const followerKeysList = this.injectListKeys(this.db.ref(`userInfo/followersPerUser/${uid}`));
    const followersListObservable = this.UserArrayFromKeyArray(followerKeysList as any);
    return followersListObservable;
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

  injectObjectKey(object) {
  //   return object
  //   .snapshotChanges()
  //     .pipe(map(element => {
  //       return {
  //         $key: element.key,
  //         ...element.payload.val()
  //       };
  //     }));
  //   return object;

  }

  injectListKeys(list) {
    // return list
    //   .snapshotChanges()
    //   .pipe(map(elements => {
    //     return elements.map(element => {
    //       return {
    //         $key: element.key,
    //         ...element.payload.val()
    //       };
    //     });
    //   }));
  }

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