import { UploadService } from '../../../services/upload.service';
import { Component, OnInit, Input } from '@angular/core';
import { Upload } from 'app/shared/class/upload';


@Component({
  selector: 'cos-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit {
  currentUpload: Upload;
  selectedFiles: any;
  @Input() articleId;
  // refactor: change uid to userId for clarity. (may also rename to image uplaod form and question wither we need a separate article-cover-image component for this)
  @Input() uid;
  @Input() articleStatus;

  constructor(
    private upSvc: UploadService,
  ) { }

  ngOnInit() { }

  detectFiles(event) {
    this.selectedFiles = event.target.files;
    return this.selectedFiles;
  }

  uploadImage() {
    const file = this.selectedFiles.item(0);
    // using this.currentUpload so we can display progress... 
    this.currentUpload = new Upload(file);
    if (!!this.articleId) {
      this.upSvc.uploadArticleCoverImage(this.currentUpload, this.articleId, this.articleStatus);
    }
    else {
      // may change this to not work for profile images, simplifying the logic.
      this.sendImgToUploadSvc(this.uid, 'uploads/profileImages/');
    }
  }

  // may become depricated
  // setBasePath() {
  //   if (!!this.articleId) {
  //     const basePath = 'uploads/articleCoverImages/';
  //     this.sendImgToUploadSvc(this.articleId, basePath);
  //   } else {
  //     const basePath = 'uploads/profileImages/';
  //     this.sendImgToUploadSvc(this.uid, basePath);
  //   }
  // }

  // may become deprecated
  sendImgToUploadSvc(key, basePath) {
    const file = this.selectedFiles.item(0);
    this.currentUpload = new Upload(file);
    this.upSvc.uploadImage(this.currentUpload, key, basePath, this.articleStatus);
  }
}
