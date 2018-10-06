import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authSvc: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      return this.checkLogin(this.authSvc.isSignedIn());
  }

  checkLogin(loginStatus: boolean): boolean {
    if (loginStatus) {
      return true;
    } else {
      if (confirm("Login Required: Would you like to login now?")) {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }
}
