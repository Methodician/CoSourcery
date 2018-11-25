import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ConfirmDialogComponent } from '../../components/modals/confirm-dialog/confirm-dialog.component';
import { LoginDialogComponent } from '../../components/modals/login-dialog/login-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authSvc: AuthService,
    private dialog: MatDialog,
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
        const dialogRef = this.openLoginRequiredDialog();
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.router.navigate(['/login']);
            this.dialog.open(LoginDialogComponent);
          } else {
            this.router.navigate(['/unauthorized']);
          }
        });
        return resolve(false);
      }
    })
    return promise;
  }

  openLoginRequiredDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      dialogTitle: 'Login Required',
      dialogLine1: 'Would you like to login now?',
      dialogLine2: null
    };
    return this.dialog.open(ConfirmDialogComponent, dialogConfig);
  }

}
