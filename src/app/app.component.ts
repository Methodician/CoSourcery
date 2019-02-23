import { Component } from '@angular/core';
import {
  fader,
} from './route-animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'cos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    fader,
  ]
})
export class AppComponent {

  constructor() { }

  // this is optional if only using one animation for every route
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

}
