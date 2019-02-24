import {
  trigger,
  transition,
  style,
  query,
  animate,
  keyframes,
} from '@angular/animations';

export const profileSlide =
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
          transform: 'translateX(100%)',
          'max-height': '100vw',
          width: '100%',
          opacity: 1,
        }),
        animate('1s ease', keyframes([
          style({
            transform: 'translateX(0)',
            opacity: 1,
          })
        ])
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
          transform: 'translateX(0)',
          position: 'absolute',
          width: '100%',
        }),
        animate('1s ease', keyframes([
          style({
            transform: 'translateX(100%)',
          })
        ])
        )
      ], { optional: true }),
    ]),
  ]);
