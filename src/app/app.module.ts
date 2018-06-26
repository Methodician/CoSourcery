import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopNavComponent } from './components/shared/top-nav/top-nav.component';
import * as fb from 'firebase';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './components/general/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopNavComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
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
