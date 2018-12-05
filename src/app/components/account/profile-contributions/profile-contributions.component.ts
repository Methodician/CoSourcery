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
  @Input() profileId;
  editedArticles: ArticlePreview[];
  authoredArticles: ArticlePreview[];
  editedArticlesMap = {};
  authoredArticlesMap = {};

  constructor(private articleSvc: ArticleService) { }

  ngOnInit() {
    this.setContributionInfo(this.profileId);
  }

    // +_+++++++++++++++++++++++++++

    getAuthoredArticlesById(authorId: string) {
      this.authoredArticles = [];

      this.articleSvc.getArticleRefsByAuthor(authorId).get().subscribe(articles => {
        articles.docs.forEach(art => {
          const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
          preview$.subscribe(artPrev => {
            if (!this.authoredArticlesMap[artPrev.articleId]) {
              this.authoredArticlesMap[artPrev.articleId] = true;
              this.authoredArticles.push(artPrev);
            }
          });
        });
      });
    }

    getEditedArticlesById(editorId: string) {
      this.editedArticles = [];

      this.articleSvc.getArticlesRefsByEditor(editorId).get().subscribe(articles => {
        articles.docs.forEach(art => {
          const preview$ = this.articleSvc.getPreviewRefById(art.id).valueChanges();
          preview$.subscribe(artPrev => {
            if (!this.editedArticlesMap[artPrev.articleId]) {
              this.editedArticlesMap[artPrev.articleId] = true;
              this.editedArticles.push(artPrev);
            }
          });
        });
      });
    }

    setContributionInfo(profileId) {
      this.getAuthoredArticlesById(profileId);
      this.getEditedArticlesById(profileId);
    }

    // +_+++++++++++++++++++++++++++

}
