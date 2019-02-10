import { Injectable } from '@angular/core';
import { ArticleService } from '@services/article.service';
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from '@angular/fire/firestore';
import { ArticlePreview } from '@class/article-info';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private fsdb: AngularFirestore,
    private articleSvc: ArticleService,
  ) {}

  unflagArticle = (articleId: string) => {
    const previewRef = this.articleSvc.getPreviewRefById(articleId);
    previewRef.update({ isFlagged: false });
  };

  allArticlesRef(): AngularFirestoreCollection<ArticlePreview> {
    return this.fsdb.collection('articleData/articles/previews', ref =>
      ref.orderBy('lastUpdated', 'desc'),
    );
  }
}
