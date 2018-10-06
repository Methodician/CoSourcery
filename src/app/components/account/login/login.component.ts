import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'cos-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private AuthSvc: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.AuthSvc.startUi('auth-container');
  }

}
