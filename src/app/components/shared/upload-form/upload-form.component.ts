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
  @Input() articleKey;
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

  setBasePath() {
    if (!!this.articleKey) {
      const basePath = 'uploads/articleCoverImages/';
      this.sendImgToUploadSvc(this.articleKey, basePath);
    } else {
      const basePath = 'uploads/profileImages/';
      this.sendImgToUploadSvc(this.uid, basePath);
    }
  }

  sendImgToUploadSvc(key, basePath) {
    const file = this.selectedFiles.item(0);
    this.currentUpload = new Upload(file);
    this.upSvc.uploadImage(this.currentUpload, key, basePath, this.articleStatus);
  }
}
