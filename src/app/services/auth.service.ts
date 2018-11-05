import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as fb from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { AuthInfo } from '../shared/class/auth-info';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  fbAuth = fb.auth();
  authInfo$ = new BehaviorSubject<AuthInfo>(new AuthInfo(null, false, null, null));

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.afAuth.user.subscribe(user => {
      if (user) {
        this.authInfo$.next(new AuthInfo(user.uid, user.emailVerified, user.displayName, user.email));
      } else {
        this.authInfo$.next(new AuthInfo(null, false, null, null));
      }
      this.router.navigate(['home']);
    });
  }

  login(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

  isSignedIn() {
    return !!this.authInfo$.getValue().uid;
  }

  register(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  async sendVerificationEmail() {
    const user = this.afAuth.auth.currentUser;
    try {
      return await user.sendEmailVerification();
    } catch (err) {
      alert('It looks like your verification email was not sent. Please try again or contact support.' + err);
    }
  }

}
