import { Injectable } from '@angular/core';
import { UserInfoOpen } from '../shared/class/user-info';
import { UserService } from '../services/user.service';
import * as firebase from 'firebase';

@Injectable()
export class NotificationService {
  userInfo: UserInfoOpen = null;
fsdb;
rtdb;
  constructor(
    private userSvc: UserService) {
      this.userSvc.userInfo$.subscribe(userInfo => {
      if (userInfo.exists()) {
        this.userInfo = userInfo;
      }
    });
    this.fsdb = firebase.firestore();
    this.rtdb = firebase.database();
   }

   createFollowNotification(followerId: string, userId: string): void {
    const id = firebase.firestore().collection(`userData/${userId}/notifications`).doc();
    const notification = {
      id: id,
      userId: userId,
      followerId: followerId,
      notificationType: 'newFollower',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      // timestamp: new Date(),
      timeViewed: null
    };
    this.fsdb.doc(`userData/${userId}/notifications/${id}`).set(notification);
  }

  getNewUserNotifications(userId: string) {
    return this.fsdb.collection(`userData/${userId}/notifications`,
     ref => ref.where('timeViewed', '==', null).orderBy('timestamp', 'desc'));
  }

  getNotificationHistory(userId: string) {
    const time = new Date(0);
    return this.fsdb.collection(`userData/${userId}/notifications`, ref => ref.where('timeViewed', '>', time));
  }

  getAllUserNotifications(userId: string) {
    return this.fsdb.collection(`userData/${userId}/notifications`);
  }


  setAllNotificationsViewed(userId: string, notificationIds: string[]) {
    const batch = this.fsdb.firestore.batch();
    for (const id of notificationIds) {
      batch.update(this.fsdb.doc(`userData/${userId}/notifications/${id}`)
      .ref, {timeViewed: firebase.firestore.FieldValue.serverTimestamp()});
    }
    batch.commit();
  }

  setNotificationViewed(userId: string, notificationId: string): void {
    this.fsdb.doc(`userData/${userId}/notifications/${notificationId}`).update({
      timeViewed: firebase.firestore.FieldValue.serverTimestamp()
      // timeViewed: new Date()
    });
  }

  // kb: added this
  // maybe store the article id here in the future as well
  createFeatureNotification(authorId: string): void {
    const id = this.fsdb.collection(`userData/${authorId}/notifications`).doc();
    const notification = {
      id: id,
      userId: authorId,
      notificationType: 'articleFeature',
      // timestamp: new Date(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timeViewed: null
    };
    this.fsdb.doc(`userData/${authorId}/notifications/${id}`).set(notification);
  }

  createEditNotification(authorId: string, articleId: string): void {
    const id = this.fsdb.collection(`userData/${authorId}/notifications`).doc();
    const notification = {
      id: id,
      userId: authorId,
      articleId: articleId,
      notificationType: 'articleEdit',
      // timestamp: new Date(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timeViewed: null
    };
    this.fsdb.doc(`userData/${authorId}/notifications/${id}`).set(notification);
  }

  createNewArticleNotification(authorId: string, articleId: string): void {
    firebase.database().ref(`userInfo/followersPerUser/${authorId}`)
      .once(`value`).then(followers => {
        followers.forEach(follower => {
          console.log(follower.val());
          this.notifyFollower(follower.key, articleId, authorId);
          // userFollowers.push(follower.key);
          // console.log(follower.payload.key, follower.payload.val());
        });
      });
    // userFollowers.forEach(follower => {
    //   console.log('this user got notified', follower);
    //   this.notifyFollower(follower, articleId);
    // })
  }
  // really confusing.
  notifyFollower(followerId: string, articleId: string, authorId: string): void {
    const id = this.fsdb.collection(`userData/${followerId}/notifications`).doc();
    const notification = {
      id: id,
      userId: followerId,
      authorId: authorId,
      articleId: articleId,
      notificationType: 'followerNewArticle',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      // timestamp: new Date(),
      timeViewed: null
    };
    this.fsdb.doc(`userData/${followerId}/notifications/${id}`).set(notification);
  }


}
