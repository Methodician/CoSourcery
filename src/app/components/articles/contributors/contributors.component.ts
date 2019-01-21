import { Component, Input } from '@angular/core';
import { UserService } from '@services/user.service';
import { UserMap } from '@class/user-info';

@Component({
  selector: 'cos-contributors',
  templateUrl: './contributors.component.html',
  styleUrls: ['./contributors.component.scss']
})
export class ContributorsComponent {
  userMap: UserMap;
  _creatorId: string;
  _editors: Array<Object>;
  _editorMap: Object;
  _displayEditors: Array<Object>;
  _nextDisplayEditors: Array<Object>;
  _prevDisplayEditors: Array<Object>;
  displayEditorsPos: number;
  editorPanelCount: number;
  transitionLeft = false;
  transitionRight = false;
  notTransitioned = true;
  windowMaxWidth = 420;
  @Input() set creatorId(creatorId: string) {
    if (creatorId && creatorId !== '') {
      this.checkWindowSize();
      this.mapCreator(creatorId);
      this._creatorId = creatorId;
    }
  }
  @Input() set editorMap(editorMap: Object) {
    if (editorMap && editorMap !== {}) {
      this.checkWindowSize();
      const editors = this.mapContributors(editorMap);
      this._editors = editors;
      this._prevDisplayEditors = [];
      this._displayEditors = this._editors.slice(this.displayEditorsPos, this.editorPanelCount);
      this._nextDisplayEditors = this._editors.slice(this.displayEditorsPos + this.editorPanelCount, this.editorPanelCount * 2);
      this._editorMap = editorMap;
    }
  }
  constructor(private userSvc: UserService) {
    this.userMap = userSvc.userMap;
    this.displayEditorsPos = 0;
  }

  displayText(editorId) {
    let text = `Edits: ${this._editorMap[editorId]}`;
    if (editorId === this._creatorId) {
      text = '(creator)' + text;
    }
    return text;
  }

  checkWindowSize() {
    window.innerWidth < this.windowMaxWidth ? this.editorPanelCount = 2 : this.editorPanelCount = 3;
  }

  nextEditorPanel() {
  this.transitionLeft = true;
  this.notTransitioned = false;
  // wait for profile cards to transition
  this.checkWindowSize();
  setTimeout(() => {
    this.transitionLeft = false;
    // move displayed profile card position up three or reset if at the end
    this.displayEditorsPos += this.editorPanelCount;
    if (this.displayEditorsPos >= this._editors.length) {
      this.displayEditorsPos = 0;
    }
    // set and slice editors to get the prev, display and next segments of the _editors
    this._prevDisplayEditors = this._displayEditors;
    this._displayEditors = this._nextDisplayEditors;
    this._nextDisplayEditors = this._editors.slice(this.displayEditorsPos + this.editorPanelCount, this.displayEditorsPos + this.editorPanelCount * 2);
    // if next is empty set it to the beginning of _editors
    if (this._nextDisplayEditors.length <= 0) {
      this._nextDisplayEditors = this._editors.slice(0, this.editorPanelCount);
    }
  }, 2000);
}

prevEditorPanel() {
  this.transitionRight = true;
  // wait for profile cards to transition
  this.checkWindowSize();
  setTimeout(() => {
    this.transitionRight = false;
    const remainder = this._editors.length % this.editorPanelCount;
    // move displayed profile card position up three or reset if at the end
    this.displayEditorsPos -= this.editorPanelCount;

    // check that the DEP is still positive
    if (this.displayEditorsPos < 0 && remainder > 0) {
      // if not positive and if we have a remainder then we want the last remainder(amount) of profile cards from the _editors
      this.displayEditorsPos = this._editors.length - remainder;
    } else if (this.displayEditorsPos < 0) {
      // if not positive and if we don't have a remainder then we want the last EPC(amount) of profile cards from the _editors
      this.displayEditorsPos = this._editors.length - this.editorPanelCount;
    }

    // set and slice editors to get the prev, display and next segments of the _editors
    this._nextDisplayEditors = this._displayEditors;
    this._displayEditors = this._prevDisplayEditors;

    // check if prev position is below 0. i.e. if the DEP is less than the amount of cards on display then the prev panel
    // position will be below 0 and thus should get profile cards from the end of the _editors array
    if (this.displayEditorsPos < this.editorPanelCount && remainder > 0) {
      // if the editorPanelCount does not divide evenly into the length of the _editors array then we take the remainder(number) from the end of the _editors array. 
      // i.e. if we have 10 _editors and are displaying 3 cards per panel. the last panel should only have 1 card be cause 3 + 3 + 3 + 1(our remainder) = 10
      this._prevDisplayEditors = this._editors.slice(this._editors.length - remainder, this._editors.length);
    } else if (this.displayEditorsPos < this.editorPanelCount) {
      // if the EPC does divide evenly then we want our last panel to have EPC amount of profile cards in it from the end of the _editors array
      this._prevDisplayEditors = this._editors.slice(this._editors.length - this.editorPanelCount, this._editors.length);
    } else {
      // and if the DEP is greater than the EPC then you just take the next EPC amount of profile cards from infront of the DEP index in _editors
      this._prevDisplayEditors = this._editors.slice(this.displayEditorsPos - this.editorPanelCount, this.displayEditorsPos);
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





// =============================ORGINAL FUNCTION==============================================
// nextEditorPanel() {
//   this.transitionLeft = true;
//   this.notTransitioned = false;
//   // wait for profile cards to transition
//   setTimeout(() => {
//     this.transitionLeft = false;

//     // move displayed profile card position up three or reset if at the end
//     this.displayEditorsPos += 3;
//     if (this.displayEditorsPos >= this._editors.length) {
//       this.displayEditorsPos = 0;
//     }

//     // set and slice editors to get the prev, display and next segments of the _editors
//     this._prevDisplayEditors = this._displayEditors;
//     this._displayEditors = this._nextDisplayEditors;
//     this._nextDisplayEditors = this._editors.slice(this.displayEditorsPos + 3, this.displayEditorsPos + 6);

//     // if next is empty set it to the beginning of _editors
//     if (this._nextDisplayEditors.length <= 0) {
//       this._nextDisplayEditors = this._editors.slice(0, 3);
//     }
//   }, 2000);
// }

// prevEditorPanel() {
//   this.transitionRight = true;
//   // wait for profile cards to transition
//   setTimeout(() => {
//     this.transitionRight = false;

//     // move displayed profile card position up three or reset if at the end
//     this.displayEditorsPos -= 3;
//     if (this.displayEditorsPos < 0) {
//       this.displayEditorsPos = this._editors.length - 1;
//     }

//     // set and slice editors to get the prev, display and next segments of the _editors
//     this._nextDisplayEditors = this._displayEditors;
//     this._displayEditors = this._prevDisplayEditors;

//     // if prev is empty set it to the end of _editors
//     if (this.displayEditorsPos < 3) {
//       this._prevDisplayEditors = this._editors.slice(this._editors.length - (this._editors.length % 3), this._editors.length);
//     } else {
//       this._prevDisplayEditors = this._editors.slice(this.displayEditorsPos - 3, this.displayEditorsPos);
//     }
//   }, 2000);
// }