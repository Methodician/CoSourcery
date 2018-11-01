import { UserService } from '../../../services/user.service';
import { AuthInfo } from 'app/shared/class/auth-info';
import { AuthService } from '../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'cos-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  currentLogin: string;
  form: FormGroup;
  authInfo: AuthInfo;

  constructor(
    private router: Router,
    private authSvc: AuthService,
    private userSvc: UserService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.checkLogin();
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPass: ['', Validators.required],
      fName: ['', Validators.required],
      lName: ['', Validators.required],
      alias: '',
      imageUrl: '',
      bio: '',
      city: '',
      state: '',
      zipCode: ['', Validators.required]
    });
  }

  checkLogin() {
    this.authSvc.authInfo$.subscribe(userData => {
      this.currentLogin = userData.email;
    });
  }

  onLogOut() {
    this.authSvc.logout();
  }

  async register() {
    const val = this.form.value;
    try {
      const res = await this.authSvc.register(val.email, val.password);
      console.log('successfully registered', res);
      alert(`
        Thanks for creating an account!
        Play nice, make friends, and contribute to the wealth of knowledge we\'re building together.`);
      delete val.password;
      delete val.confirmPass;
      this.authSvc.sendVerificationEmail();
      this.createNewUser(val, res.user.uid)
    } catch (error) {
      alert('There was a problem with registration' + error);
    }
  }

  async createNewUser(formValue, userId: string) {
    try {
      await this.userSvc.createUser(formValue, userId);
      this.router.navigate(['profile']);
    } catch (err) {
      alert('We might not have saved your user info quite right. Woops!' + err);
    }
  }

  isErrorVisible(field: string, error: string) {
    const control = this.form.controls[field];
    return control.dirty && control.errors && control.errors[error];
  }

  isPasswordMatch() {
    const val = this.form.value;
    return val.password && val.password === val.confirmPass;
  }

  isControlDirty(field: string) {
    const control = this.form.controls[field];
    return control.dirty;
  }

  formValid() {
    return this.form.valid;
  }
}
