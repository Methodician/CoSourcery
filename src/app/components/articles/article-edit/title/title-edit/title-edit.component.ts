import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cos-title-edit',
  templateUrl: './title-edit.component.html',
  styleUrls: ['../../article-edit.component.scss', '../title.component.scss'],
})
export class TitleEditComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() shouldDisplay: boolean;

  constructor() {}

  ngOnInit() {}
}
