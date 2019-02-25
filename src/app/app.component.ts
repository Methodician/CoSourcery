import { Component } from '@angular/core';
import { profileSlide } from './route-animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'cos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [profileSlide],
})
export class AppComponent {
  constructor() {}

  // checks that route should be animated and returns true if it has animation property. Whichs fires @routeAnimations in HTML.
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
