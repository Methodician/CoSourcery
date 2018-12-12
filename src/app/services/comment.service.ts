import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs/operators';
import { Comment, ParentTypes, VoteDirections } from '@class/comment';

const serverTimestamp = firebase.database.ServerValue.TIMESTAMP;

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private rtdb: AngularFireDatabase
  ) { }

  createCommentStub(authorId: string, parentKey: string, parentType: ParentTypes) {
    const newComment: Comment = {
      authorId: authorId,
      parentKey: parentKey,
      text: '',
      replyCount: 0,
      parentType: parentType,
      voteCount: 0
    };
    return newComment;
  }

  getUserVotesRef(userId: string) {
    return this.rtdb.list(`commentData/votesByUser/${userId}`);
  }

  getVoteRef(voterId: string, commentKey: string): AngularFireObject<VoteDirections> {
    return this.rtdb.object(`commentData/votesByUser/${voterId}/${commentKey}`);
  }

  async getExistingVote(voteRef: AngularFireObject<VoteDirections>) {
    const existingVoteSnap = await voteRef.query.once('value');
    return existingVoteSnap.val();
  }

  async upvoteComment(voterId: string, commentKey: string, voteDirection: VoteDirections) {
    console.log('voter', voterId, 'comment', commentKey, 'voteDirection', voteDirection, 'voteType', VoteDirections[voteDirection]);
    const voteRef = this.getVoteRef(voterId, commentKey);
    const oldVote = await this.getExistingVote(voteRef);
    console.log('old vote', oldVote);
    if (oldVote && oldVote === VoteDirections.up) {
      return voteRef.set(null);
    }
    return voteRef.set(VoteDirections.up);
  }

  async downvoteComment(voterId: string, commentKey: string, voteDirection: VoteDirections) {
    console.log('voter', voterId, 'comment', commentKey, 'voteDirection', voteDirection, 'voteType', VoteDirections[voteDirection]);
    const voteRef = this.getVoteRef(voterId, commentKey);
    const oldVote = await this.getExistingVote(voteRef);
    console.log('old vote', oldVote);
    if (oldVote && oldVote === VoteDirections.down) {
      return voteRef.set(null);
    }
    return voteRef.set(VoteDirections.down);
  }

  async createComment(comment: Comment) {
    const commentToSave = {
      authorId: comment.authorId,
      text: comment.text,
      parentKey: comment.parentKey,
      lastUpdated: serverTimestamp,
      timestamp: serverTimestamp,
      parentType: comment.parentType,
      replyCount: comment.replyCount,
      voteCount: comment.voteCount,
    };

    return this.rtdb
      .list('commentData/comments')
      .push(commentToSave).key;
  }

  updateComment(comment: Comment, commentKey: string) {
    const commentToSave = {
      lastUpdated: serverTimestamp,
      text: comment.text,
    };
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

