// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDfW20vTHUiNtDfLVV8pETkzsKzzrYHEnk',
    authDomain: 'twashboard-e51d4.firebaseapp.com',
    databaseURL: 'https://twashboard-e51d4.firebaseio.com',
    projectId: 'twashboard-e51d4',
    storageBucket: '',
    messagingSenderId: '1023969739235',
    appId: '1:1023969739235:web:044216a2f34e24bcb760d6',
    measurementId: 'G-FM37HB7Y51'
  },
  twitch: {
    client_id: '6zy82zk5z8qyl29807xf32lip0g90y',
    redirect_uri: 'http://localhost:4200'
  },
  api: 'http://localhost:5001/twashboard-e51d4/us-central1/api/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
