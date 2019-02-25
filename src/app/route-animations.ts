import {
  trigger,
  transition,
  style,
  query,
  animate,
  keyframes,
} from '@angular/animations';

export const profileSlide = trigger('routeAnimations', [
  // Enter profile transition
  transition('* => Profile', [
    // designates that on entry to Profile state from anywhere(*). State is set in routing module.
    query(
      ':leave',
      [
        style({
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(
      ':enter',
      [
        style({
          'z-index': '100',
          position: 'absolute',
          width: '100%',
          'max-height': '100vh',
          transform: 'translateX(100%)',
        }),
        animate(
          '850ms ease',
          keyframes([
            style({
              transform: 'translateX(0)',
            }),
          ]),
        ),
      ],
      { optional: true },
    ),
  ]),
  // Exit profile transition
  transition('Profile => *', [
    query(
      ':enter',
      [
        style({
          position: 'absolute',
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({
          'z-index': '100',
          position: 'absolute',
          width: '100%',
          'max-height': '100vh',
          transform: 'translateX(0)',
        }),
        animate(
          '850ms ease',
          keyframes([
            style({
              transform: 'translateX(100%)',
            }),
          ]),
        ),
      ],
      { optional: true },
    ),
  ]),
]);
