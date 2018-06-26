import { Component } from '@angular/core';
import * as fb from 'firebase';
import { AuthService } from 'app/services/auth.service';
@Component({
  selector: 'cos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cos';
  data = {};

  constructor(private AuthSvc: AuthService) {
    // const db = fb.database();
    // db.ref('userInfo/open/9u5CzLBL6efjwhM9CPsetQyb62W2').on('value', (snap) => {
    //   this.data = snap.val();
    // })
    this.AuthSvc.authInfo.subscribe(info => {
      this.data = info;
    });
    this.AuthSvc.startUi('fbui-auth-container');


  }

  isSignedIn() {
    const signedIn = this.AuthSvc.isSignedIn();
    // console.log(signedIn);
    return signedIn;
  }

  signOut() {
    this.AuthSvc.signOut();
  }
}
