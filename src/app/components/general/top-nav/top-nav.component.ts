import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthInfo } from '../../../shared/class/auth-info';
import { AuthService } from '../../../services/auth.service';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'cos-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {
  authInfo: AuthInfo;
  displayName;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private articleSvc: ArticleService
  ) { }

  ngOnInit() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.authInfo = userData;
      this.displayName = this.authInfo.email;
    });
  }

  onSearch(input) {
    // Need search function.
  }

  onLogOut() {
    this.authSvc.signOut();
  }

}
