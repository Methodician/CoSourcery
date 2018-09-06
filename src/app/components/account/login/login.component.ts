import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  currentLogin: string;

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkLogin();
    this.authSvc.startUi('auth-container');
  }

  checkLogin() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.currentLogin = userData.email;
    });
  }

  onLogOut() {
    this.authSvc.signOut();
  }

}
