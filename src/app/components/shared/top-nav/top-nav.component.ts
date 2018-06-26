import { Component, OnInit } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AuthInfo } from 'app/shared/class/auth-info';
import { AuthService } from 'app/services/auth.service';
import { UserService } from 'app/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  isCollapsed = true;
  userInfo: UserInfoOpen;
  authInfo: AuthInfo = new AuthInfo(null, false);
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
    }
  }

  ngOnInit() {
  }

}

export enum searchBarFocus {
  'focus' = 1,
  'inactive'
}