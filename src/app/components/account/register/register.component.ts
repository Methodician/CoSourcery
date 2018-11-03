import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'cos-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  currentLogin: string;
  registerForm: FormGroup;

  constructor(
    private router: Router,
    private authSvc: AuthService,
    private userSvc: UserService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.checkLogin();
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30)
      ]],
      confirmPass: ['', Validators.required],
      fName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      lName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      alias: ['', Validators.maxLength(30)],
      imageUrl: '',
      bio: '',
      city: '',
      state: '',
      zipCode: ''
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
    const val = this.registerForm.value;
    try {
      const res = await this.authSvc.register(val.email, val.password);
      console.log('Successful Registration:', res);
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
    } catch (err) {
      alert('We might not have saved your user info quite right. Woops!' + err);
    }
  }

  trimInput(formControlName) {
    this.registerForm.patchValue(
      { [formControlName]: this.registerForm.value[formControlName].trim() }
    );
  }

}
