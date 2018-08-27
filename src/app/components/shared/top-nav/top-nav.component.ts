import { Component } from '@angular/core';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AuthInfo } from 'app/shared/class/auth-info';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { ArticleService } from '../../../services/article.service';


@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {

  isCollapsed = true;
  userInfo: UserInfoOpen;
  authInfo: AuthInfo;
  displayName = '';
  scrollTop = 0;
  searchBarState: searchBarFocus = searchBarFocus.inactive;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private articleSvc: ArticleService
  ) {
    window.onscroll = (event) => {
      this.scrollTop = (event.target as any).scrollingElement.scrollTop;
    };
    this.authSvc.authInfo$.subscribe(userData => {
      this.authInfo = userData;
      this.displayName = this.authInfo.email;
    });
  }


create() {
  this.articleSvc.createArticleId();
  this.router.navigate(['createarticle']);
}

logOutClick() {
  this.authSvc.signOut();
}

}


export enum searchBarFocus {
  'focus' = 1,
  'inactive'
}
