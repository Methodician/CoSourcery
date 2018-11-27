import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserMap, UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { HtmlInputEvent } from 'app/components/articles/article-edit/article-edit.component';

@Component({
  selector: 'cos-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  @Input() profileForm: FormGroup;
  @Input() userMap: UserMap;
  @Input() loggedInUserId: boolean;
  @Input() dbUser: UserInfoOpen;
  @Input() profileImageFile: File;
  @Input() imageUploadTask: AngularFireUploadTask;
  @Input() imageUploadPercent$: Observable<number>;
  @Input() tempImageUploadPath: string;

  @Output() trimInputEmitter = new EventEmitter<string>();
  @Output() selectProfileImageEmitter = new EventEmitter<string>();
  @Output() profileChangesEmitter = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  emitTrimInput(input) {
    this.trimInputEmitter.next(input);
  }

  emitProfileImageSelect(event) {
    this.selectProfileImageEmitter.next(event);
  }

  emitProfileChanges() {
    this.profileChangesEmitter.next();
  }
}
