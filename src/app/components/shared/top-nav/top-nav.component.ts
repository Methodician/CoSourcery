
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthInfo } from '../../../shared/class/auth-info';
import { UserInfoOpen } from '../../../shared/class/user-info';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {

  userInfo: UserInfoOpen;
  authInfo: AuthInfo;
  displayName;

  constructor(
    private authSvc: AuthService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.authInfo = userData;
      this.displayName = this.authInfo.email;
    });
  }


  onSearch(input) {
    // Need search function.
  }


  onCreatePost() {
    this.router.navigate(['createarticle']);
  }

  onSignOut() {
    this.authSvc.signOut();
  }

  navigateToLogin() {
    this.router.navigate(['register']);
  }


}
