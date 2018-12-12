import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ArticlePreview } from 'app/shared/class/article-info';
import { ArticleService } from 'app/services/article.service';

@Component({
  selector: 'cos-profile-contributions',
  templateUrl: './profile-contributions.component.html',
  styleUrls: ['./profile-contributions.component.scss']
})
export class ProfileContributionsComponent implements OnInit, OnChanges {
  @Input() loggedInUserId;
  @Input() profileId;
  @Input() minDisplayNum;
  editedArticles: ArticlePreview[];
  displayedEditedArticles: ArticlePreview[];
  authoredArticles: ArticlePreview[];
  displayedAuthoredArticles: ArticlePreview[];
  editedArticlesMap = {};
  authoredArticlesMap = {};

  constructor(private articleSvc: ArticleService) { }

  ngOnInit() {
    this.setContributionInfo();
  }

  ngOnChanges() {
    this.editedArticlesMap = {};
    this.authoredArticlesMap = {};
    this.setContributionInfo();
  }

  watchAuthoredArticles() {
    this.authoredArticles = [];
    this.displayedAuthoredArticles = [];

    this.articleSvc.getPreviewRefsByAuthor(this.profileId).valueChanges().subscribe(previews => {
      previews.forEach(preview => {
        this.authoredArticlesMap[preview.articleId] = preview;
      });

      for (const key in this.authoredArticlesMap) {
        if (this.authoredArticlesMap.hasOwnProperty(key)) {

          this.authoredArticles.push(this.authoredArticlesMap[key]);
          if (this.displayedAuthoredArticles.length < this.minDisplayNum) {
            this.displayedAuthoredArticles.push(this.authoredArticlesMap[key]);
          }

        }
      }
    });
  }

  watchEditedArticles() {
    this.editedArticles = [];
    this.displayedEditedArticles = [];

    this.articleSvc.getPreviewRefsByEditor(this.profileId).valueChanges().subscribe(previews => {
      previews.forEach(preview => {
        this.editedArticlesMap[preview.articleId] = preview;
      });

      for (const key in this.editedArticlesMap) {
        if (this.editedArticlesMap.hasOwnProperty(key)) {

          this.editedArticles.push(this.editedArticlesMap[key]);
          if (this.displayedEditedArticles.length < this.minDisplayNum) {
            this.displayedEditedArticles.push(this.editedArticlesMap[key]);
          }

        }
      }
    });
  }

  setContributionInfo() {
    this.watchAuthoredArticles();
    this.watchEditedArticles();
  }

  toggleAllAuthored() {
    if (this.displayedAuthoredArticles.length > this.minDisplayNum) {
      this.displayedAuthoredArticles = this.displayedAuthoredArticles.slice(0, this.minDisplayNum);
    } else {
      this.displayedAuthoredArticles = this.authoredArticles;
    }
  }

  toggleAllEdited() {
    if (this.displayedEditedArticles.length > this.minDisplayNum) {
      this.displayedEditedArticles = this.displayedEditedArticles.slice(0, this.minDisplayNum);
    } else {
      this.displayedEditedArticles = this.editedArticles;
    }
  }

}
