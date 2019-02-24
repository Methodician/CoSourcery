import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthInfo } from '@class/auth-info';
import { AuthService } from '@services/auth.service';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '@modals/login-dialog/login-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {
  authInfo: AuthInfo;
  showMobileMenu = false;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private _location: Location,
  ) { }

  ngOnInit() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.authInfo = userData;
    });
  }

  onSearch(input) {
    this.router.navigate(['search', input]);
  }

  navigateProfile() {
    this.router.url.includes('profile') ? this._location.back() : this.router.navigate(['/profile', this.authInfo.uid]);
  }

  onLogin() {
    this.dialog.open(LoginDialogComponent);
  }

  onLogout() {
    this.authSvc.logout();
  }

}
