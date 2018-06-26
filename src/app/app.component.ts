import { Component } from '@angular/core';
import * as fb from 'firebase';
import { AuthService } from 'app/services/auth.service';
@Component({
  selector: 'cos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cos';
  data = {};

  constructor(private AuthSvc: AuthService) {
    this.AuthSvc.startUi('fbui-auth-container');
    const db = fb.database();
    db.ref('userInfo/open/9u5CzLBL6efjwhM9CPsetQyb62W2').on('value', (snap) => {
      this.data = snap.val();
    })
  }
}
