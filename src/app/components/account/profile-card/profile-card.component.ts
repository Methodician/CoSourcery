import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UserInfoOpen } from '@class/user-info';

@Component({
  selector: 'cos-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onWindowResize($event: any) {
    this.checkWindowSize();
  }
  @Input() user: UserInfoOpen;
  @Input() displayText: string;
  @Input() shouldHighlight = false;
  windowMaxWidth = 435;
  maxUsernameLength;

  constructor() {}

  ngOnInit() {
    this.checkWindowSize();
  }

  checkWindowSize() {
    window.innerWidth < this.windowMaxWidth
      ? (this.maxUsernameLength = 6)
      : (this.maxUsernameLength = 8);
  }
}
