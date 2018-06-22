import { Component } from '@angular/core';
import * as fb from 'firebase';

@Component({
  selector: 'cos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cos';

  data = {};
  config = {
    apiKey: "AIzaSyBn8hJ2vDLN21aUl9cP-RgeOWZHZOlbtdY",
    authDomain: "scatterschool-dev.firebaseapp.com",
    databaseURL: "https://scatterschool-dev.firebaseio.com",
    projectId: "scatterschool-dev",
    storageBucket: "scatterschool-dev.appspot.com",
    messagingSenderId: "945815872407"
  };

  constructor() {
    fb.initializeApp(this.config);
    const db = fb.database();
    db.ref('userInfo/open/9u5CzLBL6efjwhM9CPsetQyb62W2').on('value', (snap) => {
      this.data = snap.val();
    })
  }
}
