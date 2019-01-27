import { Component, Input, HostListener } from '@angular/core';
import { UserService } from '@services/user.service';
import { UserMap } from '@class/user-info';

@Component({
  selector: 'cos-contributors',
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.scss']
})
export class ContributorsComponent {
  @HostListener('window:resize', ['$event'])
  onWindowResize($event: any) {
    this.checkWindowSize();
  }
  userMap: UserMap;
  _creatorId: string;
  _editors: Array<Object>;
  _editorMap: Object;
  _displayEditors: Array<Object>;
  _displayEditorsNext: Array<Object>;
  _displayEditorsPrev: Array<Object>;
  displayEditorsPosition = 0;
  editorPanelCount: number;
  transitionLeft = false;
  transitionRight = false;
  hasTransitioned = false;
  windowMaxWidth = 780;

  @Input() set creatorId(creatorId: string) {
    if (creatorId && creatorId !== '') {
      this.mapCreator(creatorId);
      this._creatorId = creatorId;
    }
  }
  @Input() set editorMap(editorMap: Object) {
    if (editorMap && editorMap !== {}) {
      const editors = this.mapContributors(editorMap);
      this._editors = editors;
      this._displayEditorsPrev = [];
      this._displayEditors = this._editors.slice(this.displayEditorsPosition, this.editorPanelCount);
      this._displayEditorsNext = this._editors.slice(this.displayEditorsPosition + this.editorPanelCount, this.editorPanelCount * 2);
      this._editorMap = editorMap;
    }
  }
  constructor(private userSvc: UserService) {
    this.checkWindowSize();
    this.userMap = userSvc.userMap;
  }

  displayText(editorId) {
    let text = `Edits: ${this._editorMap[editorId]}`;
    if (editorId === this._creatorId) {
      text = text + ' (creator)';
    }
    return text;
  }

  checkWindowSize() {
    window.innerWidth < this.windowMaxWidth ? this.editorPanelCount = 2 : this.editorPanelCount = 3;
  }

  nextEditorPanel() {
  this.transitionLeft = true;
  this.hasTransitioned = true;
  // wait for profile cards to transition
  setTimeout(() => {
    this.transitionLeft = false;
    // move displayed profile card position up three or reset if at the end
    this.displayEditorsPosition += this.editorPanelCount;
    if (this.displayEditorsPosition >= this._editors.length) {
      this.displayEditorsPosition = 0;
    }
    // set and slice editors to get the prev, display and next segments of the _editors
    this._displayEditorsPrev = this._displayEditors;
    this._displayEditors = this._displayEditorsNext;
    this._displayEditorsNext = this._editors.slice(this.displayEditorsPosition + this.editorPanelCount, this.displayEditorsPosition + this.editorPanelCount * 2);
    // if next is empty set it to the beginning of _editors
    if (this._displayEditorsNext.length <= 0) {
      this._displayEditorsNext = this._editors.slice(0, this.editorPanelCount);
    }
  }, 2000);
}

prevEditorPanel() {
  this.transitionRight = true;
  // wait for profile cards to transition
  setTimeout(() => {
    this.transitionRight = false;
    const remainder = this._editors.length % this.editorPanelCount;
    // move displayed profile card position up three or reset if at the end
    this.displayEditorsPosition -= this.editorPanelCount;

    // check that the displayEditorsPosition is still positive
    if (this.displayEditorsPosition < 0 && remainder > 0) {
      // if not positive and if we have a remainder then we want the last remainder(amount) of profile cards from the _editors
      this.displayEditorsPosition = this._editors.length - remainder;
    } else if (this.displayEditorsPosition < 0) {
      // if not positive and if we don't have a remainder then we want the last editorPanelCount(amount) of profile cards from the _editors
      this.displayEditorsPosition = this._editors.length - this.editorPanelCount;
    }

    // set and slice editors to get the prev, display and next segments of the _editors
    this._displayEditorsNext = this._displayEditors;
    this._displayEditors = this._displayEditorsPrev;

    // check if prev position is below 0. i.e. if the displayEditorsPosition is less than the amount of cards on display then the prev panel
    // position will be below 0 and thus should get profile cards from the end of the _editors array
    if (this.displayEditorsPosition < this.editorPanelCount && remainder > 0) {
      // if the editorPanelCount does not divide evenly into the length of the _editors array then we take the remainder(number) from the end of the _editors array. 
      // i.e. if we have 10 _editors and are displaying 3 cards per panel. the last panel should only have 1 card be cause 3 + 3 + 3 + 1(our remainder) = 10
      this._displayEditorsPrev = this._editors.slice(this._editors.length - remainder, this._editors.length);
    } else if (this.displayEditorsPosition < this.editorPanelCount) {
      // if the editorPanelCount does divide evenly then we want our last panel to have editorPanelCount amount of profile cards in it from the end of the _editors array
      this._displayEditorsPrev = this._editors.slice(this._editors.length - this.editorPanelCount, this._editors.length);
    } else {
      // and if the displayEditorsPosition is greater than the editorPanelCount then you just take the next editorPanelCount amount of profile cards from infront of the displayEditorsPosition index in _editors
      this._displayEditorsPrev = this._editors.slice(this.displayEditorsPosition - this.editorPanelCount, this.displayEditorsPosition);
    }
  }, 2000);
}

  mapCreator(creatorId: string) {
    this.userSvc.addUserToMap(creatorId);
  }

  mapContributors(editorMap: Object) {
    const editorArray = [];
    for (const key in editorMap) {
      if (this._creatorId === key) {
        continue;
      }
      this.userSvc.addUserToMap(key);
      editorArray.push({ id: key, editCount: editorMap[key] });
    }
    editorArray.sort((a, b) => {
      if (a.editCount < b.editCount) {
        return 1;
      }
      if (a.editCount > b.editCount) {
        return -1;
      }
      return 0;
    });
    editorArray.unshift({ id: this._creatorId, editCount: editorMap[this._creatorId] });
    return editorArray;
  }

}

