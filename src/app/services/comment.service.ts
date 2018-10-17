import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs/operators';

const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private afdb: AngularFireDatabase
  ) { }

  createComment(comment, parentKey, userId) {
    comment.serverTimestamp = serverTimestamp;
    comment.lastUpdated = serverTimestamp;
    comment.authorId = userId;
    comment.parentKey = parentKey;

    const commentKey = this.afdb
      .list(`commentData/comments/${parentKey}`)
      .push(comment);

    this.afdb.object(`commentData/commentsByParent/${parentKey}/${commentKey}`).set(true);
  }

  updateComment(commentSnapshot, newCommentText: string) {
    const comment = commentSnapshot.payload.val();
    comment.lastUpdated = serverTimestamp;
    comment.text = newCommentText;
    return this.afdb
      .object(`commentData/comments/${commentSnapshot.key}`)
      .update(comment);
  }

  removeComment(commentSnapshot) {
    const comment = commentSnapshot.payload.val();
    comment.removedAt = serverTimestamp;

    this.afdb.object(`commentData/archivedComments/${commentSnapshot.key}`).set(comment);

    comment.text = 'This comment was removed';

    return this.afdb
      .object(`commentData/comments/${commentSnapshot.key}`)
      .update(comment);
  }

  watchComments(parentKey: string) {
    return this.afdb
      .list(`commentData/commentsByParent/${parentKey}`)
      .snapshotChanges()
      //  Also works with ".pipe(map(..." strangely enough. Test with changing data
      // .pipe(map(snapshots => {
      .pipe(combineLatest(snapshots => {
        return snapshots.map(snapshot => {
          return this.watchCommentByKey(snapshot.key).snapshotChanges();
        });
      }));

  }

  watchCommentByKey(key: string) {
    return this.afdb.object(`commentData/comments/${key}`);
  }




}
