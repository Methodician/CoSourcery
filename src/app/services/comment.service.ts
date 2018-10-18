import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs/operators';

const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private rtdb: AngularFireDatabase
  ) { }

  createComment(text, parentKey, userId) {
    const comment = {
      timestamp: serverTimestamp,
      lastUpdated: serverTimestamp,
      text: text,
      authorId: userId,
      parentKey: parentKey
    }

    const commentKey = this.rtdb
      .list('commentData/comments')
      .push(comment).key;

    this.rtdb.object(`commentData/commentsByParent/${parentKey}/${commentKey}`).set(true);
    this.rtdb.object(`commentData/commentsByUser/${userId}/${commentKey}`).set(true);
  }

  updateComment(commentSnapshot, newCommentText: string) {
    const comment = commentSnapshot.payload.val();
    comment.lastUpdated = serverTimestamp;
    comment.text = newCommentText;
    return this.rtdb
      .object(`commentData/comments/${commentSnapshot.key}`)
      .update(comment);
  }

  removeComment(commentSnapshot) {
    const comment = commentSnapshot.payload.val();
    comment.removedAt = serverTimestamp;

    this.rtdb.object(`commentData/archivedComments/${commentSnapshot.key}`).set(comment);

    comment.text = 'This comment was removed';

    return this.rtdb
      .object(`commentData/comments/${commentSnapshot.key}`)
      .update(comment);
  }

  watchComments(parentKey: string) {
    return this.rtdb
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

  watchCommentByKey(key: string): AngularFireObject<{}> {
    return this.rtdb.object(`commentData/comments/${key}`);
  }

  async getUserInfo(uid): Promise<firebase.database.DataSnapshot> {
    if (uid) {
      return this.rtdb.object(`userInfo/open/${uid}`).query.once('value');
    }
    return null;
  }


}
