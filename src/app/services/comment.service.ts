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

  createCommentStub(authorId: string, parentKey: string){
    return new Comment(authorId, parentKey, '');
  }
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

  updateComment(comment: Comment, commentKey: string) {
    const commentToSave = {
      lastUpdated: serverTimestamp,
      text: comment.text,
    }
    return this.rtdb
      .object(`commentData/comments/${commentKey}`)
      .update(commentToSave);
  }

  removeComment(commentKey) {
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
