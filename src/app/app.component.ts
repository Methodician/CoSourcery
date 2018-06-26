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

  constructor(private AuthSvc: AuthService) { }

}

