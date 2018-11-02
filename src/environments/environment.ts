// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  fbConfig: {
    apiKey: 'AIzaSyAb3L-t-WB0rf6A9j8gVSRB9STJJvLUEfw',
    authDomain: 'cosourcerytest.firebaseapp.com',
    databaseURL: 'https://cosourcerytest.firebaseio.com',
    projectId: 'cosourcerytest',
    storageBucket: 'cosourcerytest.appspot.com',
    messagingSenderId: '146479623747'
  },
  algoliaIndex: 'dev_articles',
  production: false
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
