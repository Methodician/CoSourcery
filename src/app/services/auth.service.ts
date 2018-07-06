import { Injectable } from '@angular/core';
import * as fb from 'firebase';
import * as fbui from 'firebaseui';
import { BehaviorSubject } from 'rxjs';
import { AuthInfo } from '../shared/class/auth-info';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // DOCS FOR REFERENCE:
  // https://firebase.google.com/docs/auth/web/firebaseui
  // https://github.com/firebase/firebaseui-web
  db: any;
  ui: any;
  authInfo = new BehaviorSubject<AuthInfo>(new AuthInfo(null, false, null, null));
  accessToken = new BehaviorSubject<string>(null);


  //  ===THIS SHOULD BE IMPORTED FROM ANOTHER FILE===
  uiConfig = {
    callbacks: { // the callbacks config is optional
      signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        // User successfully signed in.
        // Return type determines whether we continue to the redirect automatically
        // or whether we leave that to the developer to handle.
        console.log('signInSuccessWithAuthResult, authResult:', authResult);
        console.log('signInSuccessWithAuthResult, redurectUrl:', redirectUrl);
        return true;
      },
      uiShown: () => {
        // The widget is rendered.
        // Hide the loader.
        // eg: document.getElementById('loader').style.display = 'none';
        console.log('uiShown callback run from uiConfig.');
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      // Uncomment the lines as is for the providers you want to offer your users.
      // fb.auth.GoogleAuthProvider.PROVIDER_ID,
      // fb.auth.FacebookAuthProvider.PROVIDER_ID,
      // fb.auth.TwitterAuthProvider.PROVIDER_ID,
      // fb.auth.GithubAuthProvider.PROVIDER_ID,
      fb.auth.EmailAuthProvider.PROVIDER_ID,
      // fb.auth.PhoneAuthProvider.PROVIDER_ID
    ],

    // Keeps fbui from routing to accountchooser.com
    credentialHelper: fbui.auth.CredentialHelper.NONE
    // Terms of service url.
    // , tosUrl: '<your-tos-url>'
  };

  constructor(private router: Router) {
    // this.testAuthSub();
    this.ui = new fbui.auth.AuthUI(fb.auth());
    fb.auth().onAuthStateChanged((user) => {
      if (user) {
        const authInfo = new AuthInfo(user.uid, user.emailVerified, user.displayName, user.email);
        this.authInfo.next(authInfo);
        user.getIdToken().then((token) => {
          // console.log('token:', token);
          this.accessToken.next(token);
        });
      } else {
        this.accessToken.next(null);
        this.authInfo.next(new AuthInfo(null, false, '', ''));
      }
    }, (err) => {
      console.log(err);
    });
  }

  startUi(authContainerId: string) {
    console.log(authContainerId);
    const stringRef = `#${authContainerId}`;
    console.log(stringRef);

    // if (this.ui.isPendingRedirect()) {
    this.ui.start(stringRef, this.uiConfig);
    // }
  }

  signOut() {
    fb.auth().signOut();
    this.router.navigate(['login']);
  }

  isSignedIn() {
    return !!this.accessToken.value;
  }


  // testing only:
  testAuthSub() {
    this.authInfo.subscribe(info => {
      if (info) {
        console.log('auth BehaviorSubject:', info);
        console.log('am I logged in?', info.isLoggedIn());
        console.log('is my email verified?', info.isEmailVerified());
      }
    });
  }
}
