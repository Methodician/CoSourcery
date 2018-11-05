import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  currentLogin: string;
  loginForm: FormGroup;
  loginError: string = null;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.currentLogin = userData.email;
    });
  }

  onLogIn() {
    this.loginError = null;
    const val = this.loginForm.value;
    this.authSvc.login(val.email, val.password).then(res => {
      console.log('Successfully logged in');
    }).catch(err => {
      this.loginError = 'Your login email or password is incorrect.';
    });
  }

  onLogOut() {
    this.authSvc.logout();
  }

}
