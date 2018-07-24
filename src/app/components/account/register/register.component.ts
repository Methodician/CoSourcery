import { UserService } from '../../../services/user.service';
import { AuthInfo } from 'app/shared/class/auth-info';
import { AuthService } from '../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, } from '@angular/forms';

@Component({
  selector: 'cos-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  authInfo: AuthInfo;

  constructor(
    private authSvc: AuthService,
    private userSvc: UserService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPass: ['', Validators.required],
      fName: ['', Validators.required],
      lName: ['', Validators.required],
      alias: '',
      bio: '',
      city: '',
      state: '',
      zipCode: ['', Validators.required]
    });
    window.scrollTo(0, 0);
  }

  register() {
    const val = this.form.value;
    console.log('val', val);

    this.authSvc
      .register(val.email, val.password)
      .subscribe(async res => {
        delete val.password;
        delete val.confirmPass;
        this.authSvc.sendVerificationEmail();
        alert(`
          Thanks for creating an account!
          Play nice, make friends, and contribute to the wealth of knowledge we\'re building together.`
        );
        try {
          await this.userSvc.createUser(val, res.user.uid);
          if (val.alias) {
            this.authSvc.setDisplayName(val.alias);
          }
        } catch (err) {
          alert('We might not have saved your user info quite right. Woops!' + err);
        }

      }, err => alert(err));
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
