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
  transitionLeft = false;
  transitionRight = false;
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
      this._prevDisplayEditors = [];
      this._displayEditors = this._editors.slice(this.displayEditorsPos, 3);
      this._nextDisplayEditors = this._editors.slice(this.displayEditorsPos + 3, 6);
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

  nextEditorPanel() {
    this.transitionLeft = true;
    // wait for profile cards to transition
    setTimeout(() => {
      this.transitionLeft = false;

      // move displayed profile card position up three or reset if at the end
      this.displayEditorsPos += 3;
      if (this.displayEditorsPos >= this._editors.length) {
        this.displayEditorsPos = 0;
      }

      // set and slice editors to get the prev, display and next segments of the _editors
      this._prevDisplayEditors = this._displayEditors;
      this._displayEditors = this._nextDisplayEditors;
      this._nextDisplayEditors = this._editors.slice(this.displayEditorsPos + 3, this.displayEditorsPos + 6);

      // if next is empty set it to the beginning of _editors
      if (this._nextDisplayEditors.length <= 0) {
        this._nextDisplayEditors = this._editors.slice(0, 3);
      }
    }, 2000);
  }

  prevEditorPanel() {
    this.transitionRight = true;
    // wait for profile cards to transition
    setTimeout(() => {
      this.transitionRight = false;

      // move displayed profile card position up three or reset if at the end
      this.displayEditorsPos -= 3;
      if (this.displayEditorsPos < 0) {
        this.displayEditorsPos = this._editors.length - 1;
      }

      // set and slice editors to get the prev, display and next segments of the _editors
      this._nextDisplayEditors = this._displayEditors;
      this._displayEditors = this._prevDisplayEditors;

      // if prev is empty set it to the end of _editors
      if (this.displayEditorsPos < 3) {
        this._prevDisplayEditors = this._editors.slice(this._editors.length - (this._editors.length % 3), this._editors.length);
      } else {
        this._prevDisplayEditors = this._editors.slice(this.displayEditorsPos - 3, this.displayEditorsPos);
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
