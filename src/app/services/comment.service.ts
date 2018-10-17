import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs/operators';

const timestamp = firebase.database.ServerValue.TIMESTAMP;

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private afdb: AngularFireDatabase
  ) { }

  createComment(comment, parentKey, userId) {
    comment.timestamp = timestamp;
    comment.lastUpdated = timestamp;
    comment.authorId = userId;
    comment.parentKey = parentKey;

    const commentKey = this.afdb
      .list(`commentData/comments/${parentKey}`)
      .push(comment);

    this.afdb.object(`commentData/commentsByParent/${parentKey}/${commentKey}`).set(true);
  }

  updateComment(commentSnapshot) {
    commentSnapshot.payload.lastUpdated = timestamp;
    this.afdb
      .object(`commentData/commentsByParent/${commentSnapshot.payload.parentKey}/${commentSnapshot.key}`)
      .update(commentSnapshot.payload);
  }

  watchComments(parentKey: string) {

    return this.afdb
      .list(`commentData/commentsByParent/${parentKey}`)
      .snapshotChanges()
      //  Also works with ".pipe(map(..." strangely enough. Test with changing data
      // .pipe(map(snapshots => {
      .pipe(combineLatest(snapshots => {
        return snapshots.map(snapshot => {
          // logs actual comments
          // this.watchCommentByKey(snapshot.key).snapshotChanges().subscribe(snapshot => console.log(snapshot.payload.val()));
          return this.watchCommentByKey(snapshot.key).snapshotChanges();
        });
      }));

  }

  watchCommentByKey(key: string) {
    return this.afdb.object(`commentData/comments/${key}`);
  }




}
