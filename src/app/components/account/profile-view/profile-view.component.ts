import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cos-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  @Input() user;

  constructor() { }

  ngOnInit() {
  }

}
