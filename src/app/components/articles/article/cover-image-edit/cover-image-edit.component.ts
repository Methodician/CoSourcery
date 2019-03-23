import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { HtmlInputEvent } from '../article.component';
import { ArticleService } from '@services/article.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cos-cover-image-edit',
  templateUrl: './cover-image-edit.component.html',
  styleUrls: ['./cover-image-edit.component.scss'],
})
export class CoverImageEditComponent implements OnDestroy {
  @Input() isCtrlActive: boolean;
  @Input() parentForm: FormGroup;

  @Input() set shouldAbort(shouldAbort: boolean) {
    if (shouldAbort) {
      this.cancelUpload();
      this.deleteTempCoverImage();
    }
  }

  @Output() onCoverImageSelected: EventEmitter<{
    url: string;
    coverImageFile: File;
  }> = new EventEmitter();

  tempCoverImageUploadPath: string;
  coverImageUploadTask: AngularFireUploadTask;
  coverImageUploadPercent$: Observable<number>;

  constructor(private articleSvc: ArticleService) {}

  ngOnDestroy() {
    this.cancelUpload();
    this.deleteTempCoverImage();
  }

  async onSelectCoverImage(e: HtmlInputEvent) {
    const coverImageFile = e.target.files.item(0);
    const tracker = this.articleSvc.uploadTempImage(coverImageFile);
    const task = (this.coverImageUploadTask = tracker.task);
    this.coverImageUploadPercent$ = task.percentageChanges();
    const snap = await tracker.task.then();
    const url = await tracker.ref.getDownloadURL().toPromise();
    this.tempCoverImageUploadPath = snap.metadata.fullPath;
    this.onCoverImageSelected.emit({ url, coverImageFile });
  }

  deleteTempCoverImage() {
    if (this.tempCoverImageUploadPath) {
      this.articleSvc.deleteFile(this.tempCoverImageUploadPath);
    }
  }

  cancelUpload() {
    if (this.coverImageUploadTask) {
      this.coverImageUploadTask.cancel();
    }
  }
}
