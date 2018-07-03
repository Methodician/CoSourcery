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
  db: any;

  constructor(private router: Router) {
    this.db = firebase.database();
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

    this.db.ref('commentData/comments').set(commentToSave);
    // this.updateCommentCount(commentData.parentKey, commentData.parentType, 1);
  }

   // this could be replaced with an enum
   getBasePathByParentType(parentType) {
    switch (parentType) {
      case 'comment':
        return 'commentData/comments/';
      case 'article':
        return 'articleData/articles/';
      default:
        return false;
    }
  }

  updateCommentCount(parentKey, parentType, value) {
    const parentPath = this.getBasePathByParentType(parentType) + parentKey;
    this.db.ref(parentPath).query.ref.ref.transaction(parent => {
      if (parent) {
        // logic is verbose, but accounts for current data/data added which has not comment count
        if (parent.commentCount) {
          parent.commentCount += value;
        } else if (value === 1) {
          parent.commentCount = 1;
        } else if (value === -1) {
          parent.commentCount = 0;
        }
        if (parentType === 'comment') {
          this.updateCommentCount(parent.parentKey, parent.parentType, value);
        }
      }
      return parent;
    });
  }
  // async getAllSuggestions() {
  //   const suggestionsList = [];
  //   const querySnap = await this.fsdb.collection('suggestions').get()
  //   .then(docs => {
  //     docs.forEach(doc => {
  //       suggestionsList.push(doc.data());
  //     });
  //   });
  //   return suggestionsList;
  // }

  // async getSuggestionById(suggId: string) {
  //   const suggRef = this.fsdb.doc(`suggestions/${suggId}`);
  //   const docSnapshot = await suggRef.get();
  //   return docSnapshot.data();
  // }


  updateComment(newCommentData) {
    const commentDataToUpdate = {
      text: newCommentData.text,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };
    this.db
      .doc(`commentData/comments/${newCommentData.key}`)
      .update(commentDataToUpdate);
  }

  deleteComment(comment) {
    this.db
      .doc(`commentData/comments/${comment.$key}`)
      .update({ isDeleted: true });
    this.updateCommentCount(comment.parentKey, comment.parentType, -1);
  }

  getAllComments() {
    return firebase.database().ref(`commentData/comments`)
    // return this.db.collection(`commentData/comments`);
  }

  getCommentsByParentKey(parentKey: string) {
    const list = this.db.ref(`commentData/comments`, ref => {
      return ref
        .orderByChild('parentKey')
        .equalTo(parentKey);
    });
    return this.injectKey(list);
  }

  injectKey(list: any[]) {
    return list.map(elements => {
        return elements.map(element => {
          return {
            $key: element.key,
            ...element.payload.val()
          };
        });
    });
  }



}
