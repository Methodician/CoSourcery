import { Component, OnInit, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'cos-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnInit {
  @ViewChild('filterMenu') filterMenu;
  @Input() tabList = [
    { name: 'Tab 1', selected: true },
    { name: 'Tab 2', selected: false },
  ];

  @Output() tabSelected = new EventEmitter();

  filterContainerHeight: number;
  filterMenuIsSticky: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes in filter menu', changes);
  }

  onTabSelected(tabIndex: number) {
    for (let tab of this.tabList) {
      tab.selected = false;
    }
    this.tabList[tabIndex].selected = true;
  }

  checkScrollPosition() {
    const yCoordinate = window.scrollY;
    if (document.body.clientWidth >= 482) {
      this.filterMenuIsSticky = yCoordinate >= 200 ? true : false;
    } else {
      this.filterMenuIsSticky = true;
    }
  }

  adjustFilterContainerOnResize() {
    this.checkScrollPosition();
    this.setFilterContainerHeight();
  }

  setFilterContainerHeight() {
    this.filterContainerHeight = this.filterMenu.nativeElement.clientHeight;
  }

}
