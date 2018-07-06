import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as firestore from 'firebase';
//  Docs say to do this - "required for side-effects" whatever that means
// require('firebase/firestore');
import 'firebase/firestore';
import { Route, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SuggestionService {

  fsdb: any;

  constructor(private router: Router) {
    this.fsdb = firebase.firestore();
  }


  async getAllSuggestions() {
    const suggestionsList = [];
    await this.fsdb.collection('suggestions').get()
    .then(docs => {
      docs.forEach(doc => {
        suggestionsList.push(doc.data());
      });
    });
    return suggestionsList;
  }

  async getSuggestionById(suggId: string) {
    const suggRef = this.fsdb.doc(`suggestions/${suggId}`);
    const docSnapshot = await suggRef.get();
    return docSnapshot.data();
  }

  saveSuggestion(suggestion) {
    const docRef = this.fsdb.collection(`suggestions`).doc();
    const id = docRef.id;
    suggestion.id = id;
    suggestion.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    suggestion.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    suggestion.voteCount = 0;

    this.fsdb.collection(`suggestions`).doc(id).set(suggestion);
    this.router.navigate([`suggestions`]);

  }

  updateSuggestion(id: string, updatedSuggestion) {
    updatedSuggestion.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    this.fsdb.collection(`suggestions`).doc(id)
    .update(updatedSuggestion);
    this.router.navigate([`suggestions`]);
  }




  arrayFromCollectionSnapshot(querySnapshot: any, shouldAttachId: boolean = false) {
    const array = [];
    querySnapshot.forEach(doc => {
      if (shouldAttachId) {
        array.push({ id: doc.id, ...doc.data() });
      } else {
        array.push(doc.data());
      }
    });
    return array;
  }

}
