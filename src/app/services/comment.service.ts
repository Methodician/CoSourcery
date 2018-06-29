import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
//  Docs say to do this - "required for side-effects" whatever that means
// require('firebase/firestore');
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  fsdb: any;

  constructor(private router: Router) {
    this.fsdb = firebase.database();
  }
  saveComment(commentData) {
    const commentToSave = {
      authorKey: commentData.authorKey,
      parentKey: commentData.parentKey,
      parentType: commentData.parentType,
      text: commentData.text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP,
      commentCount: 0
    };

    firebase.database().ref('commentData/comments').set(commentToSave);
    // this.updateCommentCount(commentData.parentKey, commentData.parentType, 1);
  }



}
