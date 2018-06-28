import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
//  Docs say to do this - "required for side-effects" whatever that means
// require('firebase/firestore');
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  fsdb: any;

  constructor() {
    this.fsdb = firebase.firestore();
  }
}
