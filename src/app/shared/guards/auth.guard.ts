import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authSvc: AuthService
  ) { }

  canActivate(): Promise<boolean> {
    return this.checkLogin(this.authSvc.isSignedIn());
  }

  checkLogin(loginStatus: Promise<boolean>): Promise<boolean> {
    const promise = new Promise<boolean>(async (resolve, reject) => {
      const status = await loginStatus;
      if (status) {
        return resolve(true);
      } else {
        if (confirm("Login Required: Would you like to login now?")) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/unauthorized']);
        }
        return resolve(false);
      }
    })
    return promise;
  }
}
