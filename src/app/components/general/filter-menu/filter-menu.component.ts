import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'cos-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {
  // tabMap should be a keymap with names as keys and default tab = true
  @Input() tabMap = [
    { name: 'Tab 1', selected: true },
    { name: 'Tab 2', selected: false },
  ];

  filterContainerHeight: number;
  filterMenuIsSticky: boolean;

  constructor() {
  }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('changes in filter menu', changes);
  }

  selectTab(tabIndex: number) {
    for (let tab of this.tabMap) {
      tab.selected = false;
    }
    this.tabMap[tabIndex].selected = true;
  }

}
