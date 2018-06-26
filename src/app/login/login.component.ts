import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {UserInfoOpen} from '../shared/class/user-info';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'cos';
  data: {};
  constructor(private AuthSvc: AuthService) {
    this.AuthSvc.authInfo.subscribe(data => {
      this.data = data;
    });
    this.AuthSvc.startUi('fbui-auth-container');


  }

  isSignedIn() {
    const signedIn = this.AuthSvc.isSignedIn();
    return signedIn;
  }

  signOut() {
    this.AuthSvc.signOut();
  }
  ngOnInit() {
  }

}
