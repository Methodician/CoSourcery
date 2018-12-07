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
  editedArticles: ArticlePreview[];
  displayedEditedArticles: ArticlePreview[];
  authoredArticles: ArticlePreview[];
  displayedAuthoredArticles: ArticlePreview[];
  editedArticlesMap = {};
  authoredArticlesMap = {};
  // varible make it super easy to change the amount of articles we display. can remove once we're set if we like.
  // This variable does not apply to the styling though. That will also have to be changed.
  minDisplayNum = 3;

  constructor(private articleSvc: ArticleService) { }

  ngOnInit() {
    this.setContributionInfo(this.profileId);
  }

  ngOnChanges() {
    this.editedArticlesMap = {};
    this.authoredArticlesMap = {};
    this.setContributionInfo(this.profileId);

  }

  getAuthoredArticlesById(authorId: string) {
    this.authoredArticles = [];
    this.displayedAuthoredArticles = [];

    this.articleSvc.getArticleRefsByAuthor(authorId).get().subscribe(articles => {
      articles.docs.forEach(art => {
        const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
        preview$.subscribe(artPrev => {
          if (!this.authoredArticlesMap[artPrev.articleId]) {
            this.authoredArticlesMap[artPrev.articleId] = true;
            this.authoredArticles.push(artPrev);
            if (this.displayedAuthoredArticles.length < 3) {
              this.displayedAuthoredArticles.push(artPrev);
            }
          }
        });
      });
    });
  }

  getEditedArticlesById(editorId: string) {
    this.editedArticles = [];
    this.displayedEditedArticles = [];

    this.articleSvc.getArticlesRefsByEditor(editorId).get().subscribe(articles => {
      articles.docs.forEach(art => {
        const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
        preview$.subscribe(artPrev => {
          if (!this.editedArticlesMap[artPrev.articleId]) {
            this.editedArticlesMap[artPrev.articleId] = true;
            this.editedArticles.push(artPrev);
            if (this.displayedEditedArticles.length < 3) {
              this.displayedEditedArticles.push(artPrev);
            }
          }
        });
      });
    });
  }

  setContributionInfo(profileId) {
    this.getAuthoredArticlesById(profileId);
    this.getEditedArticlesById(profileId);
  }

  toggleAllAuthored() {
    if (this.displayedAuthoredArticles.length > 3) {
      this.displayedAuthoredArticles = this.displayedAuthoredArticles.slice(0, 3);
    } else {
      this.displayedAuthoredArticles = this.authoredArticles;
    }
  }

  toggleAllEdited() {
    if (this.displayedEditedArticles.length > 3) {
      this.displayedEditedArticles = this.displayedEditedArticles.slice(0, 3);
    } else {
      this.displayedEditedArticles = this.editedArticles;
    }
  }

}
