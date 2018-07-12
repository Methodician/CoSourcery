import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'cos-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.scss']
})
export class CommentFormComponent implements OnInit {
  @Input() initialValue;
  @Input() placeholderText;
  form: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(4000)]],
    });

    this.setInitialValue();
  }

  setInitialValue() {
    if (this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
  }

  get text() {
    return this.form.get('text');
  }

  get valid() {
    return this.form.valid;
  }

  get value() {
    return this.form.value;
  }
}
