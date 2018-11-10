import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'cos-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent {
  loginForm: FormGroup;
  loginError: string = null;

  constructor(
    private authSvc: AuthService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogIn() {
    this.loginError = null;
    const val = this.loginForm.value;
    this.authSvc.login(val.email, val.password).then(res => {
      this.dialogRef.close();
    }).catch(err => {
      this.loginError = 'Your login email or password is incorrect.';
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

}
