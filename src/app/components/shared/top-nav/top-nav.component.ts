import { Component, OnInit } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AuthInfo } from 'app/shared/class/auth-info';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { Router } from '@angular/router';
import { pipe } from '@angular/core/src/render3/pipe';


@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  isCollapsed = true;
  userInfo: UserInfoOpen;
  authInfo: AuthInfo;
  displayName = '';
  scrollTop = 0;
  searchBarState: searchBarFocus = searchBarFocus.inactive;

  constructor(
    private authSvc: AuthService,
    private userSvc: UserService,
    private router: Router
  ) {
    window.onscroll = (event) => {
      this.scrollTop = (event.target as any).scrollingElement.scrollTop;
    };
    this.authSvc.authInfo$.subscribe(data => {
      this.authInfo = data;
      console.log(data);
      this.displayName = this.authInfo.email;
    });
  }

  ngOnInit() {
}

logOutClick() {
  this.authSvc.signOut();
}

}

export enum searchBarFocus {
  'focus' = 1,
  'inactive'
}
