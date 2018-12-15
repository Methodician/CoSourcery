import { Component, OnInit, Input } from '@angular/core';
import { ArticlePreview } from 'app/shared/class/article-info';
import { ArticleService } from 'app/services/article.service';

@Component({
  selector: 'cos-profile-contributions',
  templateUrl: './profile-contributions.component.html',
  styleUrls: ['./profile-contributions.component.scss']
})
export class ProfileContributionsComponent implements OnInit {
  @Input() loggedInUserId;
  @Input() minDisplayNum = 3;

  _profileId;
  @Input() set profileId(profileId: string) {
    this._profileId = profileId;
    this.editedArticlesMap = {};
    this.authoredArticlesMap = {};
    this.setContributionInfo();
  }
  get profileId(): string { return this._profileId; }

  editedArticles: ArticlePreview[];
  displayedEditedArticles: ArticlePreview[];
  authoredArticles: ArticlePreview[];
  displayedAuthoredArticles: ArticlePreview[];
  editedArticlesMap = {};
  authoredArticlesMap = {};

  constructor(private articleSvc: ArticleService) { }

  ngOnInit() {
    this.displayedEditedArticles = [];
    this.displayedAuthoredArticles = [];
    this.setContributionInfo();
  }

  watchAuthoredArticles() {
    this.articleSvc.getPreviewRefsByAuthor(this.profileId).valueChanges().subscribe(previews => {
      this.authoredArticles = [];
      this.displayedAuthoredArticles = [];
      previews.forEach(preview => {
        this.authoredArticlesMap[preview.articleId] = preview;
      });

      this.authoredArticles = Object.values(this.authoredArticlesMap);
      this.displayedAuthoredArticles = this.authoredArticles.slice(0, this.minDisplayNum);

    });
  }

  watchEditedArticles() {
    this.articleSvc.getPreviewRefsByEditor(this.profileId).valueChanges().subscribe(previews => {
      this.editedArticles = [];
      this.displayedEditedArticles = [];
      previews.forEach(preview => {
        this.editedArticlesMap[preview.articleId] = preview;
      });

      this.editedArticles = Object.values(this.editedArticlesMap);
      this.displayedEditedArticles = this.editedArticles.slice(0, this.minDisplayNum);

    });
  }

  setContributionInfo() {
    this.watchAuthoredArticles();
    this.watchEditedArticles();
  }

  toggleAllAuthored() {
    if (this.displayedAuthoredArticles.length > this.minDisplayNum) {
      this.displayedAuthoredArticles = this.authoredArticles.slice(0, this.minDisplayNum);
    } else {
      this.displayedAuthoredArticles = this.authoredArticles;
    }
  }

  toggleAllEdited() {
    if (this.displayedEditedArticles.length > this.minDisplayNum) {
      this.displayedEditedArticles = this.editedArticles.slice(0, this.minDisplayNum);
    } else {
      this.displayedEditedArticles = this.editedArticles;
    }
  }

}
