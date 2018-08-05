import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../../../services/upload.service';


@Component({
  selector: 'cos-article-cover-image',
  templateUrl: './article-cover-image.component.html',
  styleUrls: ['./article-cover-image.component.scss']
})
export class ArticleCoverImageComponent implements OnInit {
  @Input() articleKey;
  articleCoverImageUrl;

  constructor(private uploadSvc: UploadService) { }

  ngOnInit() {
    this.getArticleCoverImage(this.articleKey);
  }

  getArticleCoverImage(articleKey) {
    const basePath = 'uploads/articleCoverImages/';
   this.uploadSvc
         .getImageUrl(articleKey, basePath).then(url => {
        this.articleCoverImageUrl = url;
      });
  }
}
