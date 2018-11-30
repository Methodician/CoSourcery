import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { Observable } from 'rxjs';

@Component({
  selector: 'cos-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  @Input() formUser;
  @Input() imageUploadPercent$: Observable<number>;
  @Output() selectProfileImageEmitter = new EventEmitter<string>();

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    if (this.formUser) {
      this.profileForm = this.formBuilder.group({
        alias: [this.formUser.alias, Validators.maxLength(30)],
        fName: [this.formUser.fName, [
          Validators.required,
          Validators.maxLength(30)
        ]],
        lName: [this.formUser.lName, [
          Validators.required,
          Validators.maxLength(30)
        ]],
        uid: [this.formUser.uid, Validators.required],
        imageUrl: this.formUser.imageUrl,
        email: [this.formUser.email, [
          Validators.required,
          Validators.email,
          Validators.maxLength(50)
        ]],
        zipCode: [this.formUser.zipCode, Validators.maxLength(5)],
        bio: [this.formUser.bio, Validators.maxLength(500)],
        city: [this.formUser.city, Validators.maxLength(30)],
        state: [this.formUser.state, Validators.maxLength(2)],
      });
    }
  }

  trimInput(formControlName) {
    this.profileForm.patchValue(
      { [formControlName]: this.profileForm.value[formControlName].trim() }
    );
  }

  emitProfileImageSelect($event) {
    this.selectProfileImageEmitter.emit($event);
  }

  get valid() {
    return this.profileForm.valid;
  }

  get pristine() {
    return this.profileForm.pristine;
  }

  get user(): UserInfoOpen {
    return this.profileForm.value;
  }
}
