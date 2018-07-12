import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {UserInfoOpen} from '../../../shared/class/user-info';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'cos';
  userData: {};
  constructor(private AuthSvc: AuthService) {
    this.AuthSvc.authInfo.subscribe(userData => {
      this.userData = userData;
    });
  }

  isSignedIn() {
    const signedIn = this.AuthSvc.isSignedIn();
    return signedIn;
  }

  ngOnInit() {
    this.AuthSvc.startUi('fbui-auth-container');
  }

}
