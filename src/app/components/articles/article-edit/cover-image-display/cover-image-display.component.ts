import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cos-cover-image-display',
  templateUrl: './cover-image-display.component.html',
  styleUrls: ['./cover-image-display.component.scss'],
})
export class CoverImageDisplayComponent implements OnInit {
  @Input() coverImageUrl: string;
  @Input() imageAlt: string;
  @Input() isCtrlActive: boolean;

  @Output() onCtrlToggle: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  toggleCtrl = () => {
    this.onCtrlToggle.emit();
  };
}
