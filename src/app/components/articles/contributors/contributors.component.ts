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
      this._editorMap = editorMap;
    }
  }
  constructor(private userSvc: UserService) {
    this.userMap = userSvc.userMap;
  }

  displayText(editorId) {
    let text = `Edits: ${this._editorMap[editorId]}`
    if (editorId === this._creatorId) {
      text = '(creator)' + text;
    }
    return text;
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
