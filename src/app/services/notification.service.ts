import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
fsdb = firebase.firestore();


  constructor() { }





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
}
