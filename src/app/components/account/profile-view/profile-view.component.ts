import { Component, OnInit, Input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { UserInfoOpen } from '@class/user-info';

@Component({
  selector: 'cos-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['../profile-form/profile-form.component.scss'],
})
export class ProfileViewComponent implements OnInit {
  @Input() user;

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.updateMetaData(this.user);
  }

  updateMetaData = (user: UserInfoOpen) => {
    const name = user.displayName();
    const { bio, city, state, fName, lName, alias } = user;

    // ADD PAGE TITLE
    const title = `CoSourcery - ${name}'s Profile`;
    this.title.setTitle(title);

    // ADD META DESCRIPTION
    let description = name;

    let fromPlace = '';
    if (city || state) fromPlace += ' from';
    if (city) {
      fromPlace += ` ${city}`;
      if (state) fromPlace += ',';
    }
    if (state) fromPlace += ` ${state}`;
    description += fromPlace;

    if (bio) {
      description += ` | ${bio}`;
    }

    this.meta.updateTag({ name: 'description', content: description });

    // ADD META KEYWORDS
    let keywords = name;
    if (alias) keywords += `, ${alias}`;
    if (fName) keywords += `, ${fName}`;
    if (lName) keywords += `, ${lName}`;
    if (city) keywords += `, ${city}`;
    if (state) keywords += `, ${state}`;

    if (keywords.length > 0) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }
  };
}
