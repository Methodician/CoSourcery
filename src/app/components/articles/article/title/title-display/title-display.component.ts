import { Component, Input } from '@angular/core';

@Component({
  selector: 'cos-title-display',
  templateUrl: './title-display.component.html',
  styleUrls: ['../../article.component.scss', '../title.component.scss'],
})
export class TitleDisplayComponent {
  @Input() shouldDisplay: boolean;
  @Input() title: string;
}
