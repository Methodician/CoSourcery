import { Injectable } from '@angular/core';
import { Vote } from 'app/shared/class/vote';
import * as firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class VoteService {
  fsdb;
  fb;
  constructor() {
    this.fsdb = firebase.firestore();
    this.fb = firebase.database();
  }

  getVoteState(suggestionKey, userKey) {
    const voteState = this.fb.ref(`voteData/suggestionVotesPerUser/${userKey}/${suggestionKey}`)
    .once('value').then(data => {
      return data.val();
    });
    return voteState;
  }

  saveVote(vote: Vote) {
    this.fsdb
      .doc(`suggestions/${vote.suggestionKey}`)
      .update({ voteCount: vote.voteTotal });
    this.fb
      .ref(`voteData/suggestionVotesPerUser/${vote.userKey}/${vote.suggestionKey}`)
      .set(vote.dbStatus);
    this.fb
      .ref(`voteData/userVotesPerSuggestion/${vote.suggestionKey}/${vote.userKey}`)
      .set(vote.dbStatus);
  }
}
