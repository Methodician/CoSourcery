import { Component, OnInit, Input } from '@angular/core';
import { UserInfoOpen } from '@class/user-info';

@Component({
  selector: 'cos-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit {

  @Input() user: UserInfoOpen;
  @Input() shouldHighlight = false;

  constructor() { }

  ngOnInit() {
  }

}
