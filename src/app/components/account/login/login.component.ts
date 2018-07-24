import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import {UserInfoOpen} from '../../../shared/class/user-info';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'cos';
  // Is "data" being used or this a vestigial dev tool?
  data: {};
  constructor(private AuthSvc: AuthService, private router: Router) {
    this.AuthSvc.authInfo$.subscribe(data => {
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
    this.router.navigate([`home`]);
  }
  ngOnInit() {
  }

}
