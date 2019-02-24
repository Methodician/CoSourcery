import {
  trigger,
  transition,
  style,
  query,
  animate,
} from '@angular/animations';

export const fader =
  trigger('routeAnimations', [
    // Enter profile transition
    transition('* => Profile', [    // designates that on entry to Profile state from anywhere(*). State is set in routing module.
      query(':leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 1,
          'z-index': '-100',
        }),
      ], { optional: true }),
      query(':enter', [
        style({
          position: 'absolute',
          left: 0,
          top: '-100vh',
          width: '100%',
          opacity: 0,
        }),
      ], { optional: true }),
      query(':enter', [
        animate('2s ease',
          style( {
            top: 0,
            opacity: 1,
          })
        )
      ], { optional: true }),
    ]),
    // Exit profile transition
    transition('Profile => *', [
      query(':enter', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 1,
          'z-index': '-100',
        }),
      ], { optional: true }),
      query(':leave', [
        style({
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          opacity: 1,
        }),
      ], { optional: true }),
      query(':leave', [
        animate('2s ease',
          style( {
            top: '-100vh',
            opacity: 0,
          })
        )
      ], { optional: true }),
    ]),
  ]);
