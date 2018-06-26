import { Injectable } from '@angular/core';
import * as fb from 'firebase';
import * as fbui from 'firebaseui';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  db: any;
  ui: any;

  uiConfig = {
    signInSuccessUrl: '/home',
    signInOptions: [
      // Uncomment the lines as is for the providers you want to offer your users.
      // fb.auth.GoogleAuthProvider.PROVIDER_ID,
      // fb.auth.FacebookAuthProvider.PROVIDER_ID,
      // fb.auth.TwitterAuthProvider.PROVIDER_ID,
      // fb.auth.GithubAuthProvider.PROVIDER_ID,
      fb.auth.EmailAuthProvider.PROVIDER_ID,
      // fb.auth.PhoneAuthProvider.PROVIDER_ID
    ]
  }

  constructor() {
    this.ui = new fbui.auth.AuthUI(fb.auth());
    fb.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        user.getIdToken().then((token) => {
          console.log(token);
        });
      }
    })
  }

  startUi(authContainerId: string) {
    const stringRef = `#${authContainerId}`
    if (this.ui.isPendingRedirect()) {
      this.ui.start(stringRef, this.uiConfig);
    }
  }
}
