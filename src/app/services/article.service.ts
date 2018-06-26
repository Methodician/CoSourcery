import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  firestore: any;

  constructor() {
    this.firestore = firebase.firestore();
  }
}
