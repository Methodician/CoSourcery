import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cos-title',
  templateUrl: './title.component.html',
  styleUrls: ['../article-edit.component.scss'],
})
export class TitleComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() isActive: boolean;
  @Input() title: string;

  constructor() {}

  ngOnInit() {}
}
