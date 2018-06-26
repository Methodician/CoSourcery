import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Material Imports
import {
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatChipsModule,
  MatSidenavModule,
  MatTooltipModule,
  MatTabsModule
} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopNavComponent } from './components/shared/top-nav/top-nav.component';
import * as fb from 'firebase';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  fbConfig = {
    apiKey: 'AIzaSyBn8hJ2vDLN21aUl9cP-RgeOWZHZOlbtdY',
    authDomain: 'scatterschool-dev.firebaseapp.com',
    databaseURL: 'https://scatterschool-dev.firebaseio.com',
    projectId: 'scatterschool-dev',
    storageBucket: 'scatterschool-dev.appspot.com',
    messagingSenderId: '945815872407'
  };

  constructor() {
    fb.initializeApp(this.fbConfig);
  }
}
