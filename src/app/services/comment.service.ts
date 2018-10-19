import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs/operators';
import { Comment } from 'app/shared/class/comment';
const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private rtdb: AngularFireDatabase
  ) { }

  // createComment(text, parentKey, userId) {
  async createComment(comment: Comment) {
    const commentToSave = {
      authorId: comment.authorId,
      text: comment.text,
      parentKey: comment.parentKey,
      lastUpdated: serverTimestamp,
      timestamp: serverTimestamp,
    }

    return this.rtdb
      .list('commentData/comments')
      .push(commentToSave).key;
  }

  // updateComment(commentSnapshot, newCommentText: string) {
  updateComment(comment: Comment, commentKey: string) {
    console.log(comment);
    const commentToSave = {
      lastUpdated: serverTimestamp,
      text: comment.text,
    }
    console.log(commentToSave);

    return this.rtdb
      .object(`commentData/comments/${commentKey}`)
      .update(commentToSave);
  }

  removeComment(commentKey) {
    //  REFACTOR TO CLOUD FUNCTION
    // const comment = commentSnapshot.payload.val();
    // comment.removedAt = serverTimestamp;

    // this.rtdb.object(`commentData/archivedComments/${commentSnapshot.key}`).set(comment);

    // comment.text = 'This comment was removed';

    return this.rtdb
      .object(`commentData/comments/${commentKey}`)
      .update({ removedAt: serverTimestamp });
  }

  watchCommentsByParent(parentKey: string) {
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
