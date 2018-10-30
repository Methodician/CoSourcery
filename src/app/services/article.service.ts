import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArticleDetailFirestore, ArticleDetailPreview } from 'app/shared/class/article-info';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  bookmarkedArticles$ = new BehaviorSubject<Array<any>>([]);
  timestampNow = firebase.firestore.Timestamp.now();

  constructor(
    private storage: AngularFireStorage,
    private rtdb: AngularFireDatabase,
    private fsdb: AngularFirestore
  ) { }

  createVanillaStorageRef(path: string) {
    return firebase.storage().ref(path);
  }

  uploadTempImage(file: File): { task: AngularFireUploadTask, ref: AngularFireStorageReference } {
    const id = this.createArticleId();
    const storageRef = this.storage.ref(`tempImages/${id}`);
    const task = storageRef.put(file);
    return { task: task, ref: storageRef }
  }

  deleteFile(path: string) {
    const storageRef = this.storage.ref(path);
    storageRef.delete().subscribe(res => {
      console.log('DELETED TEMP IMAGE (maybe), result: ', res);
    });
  }

  uploadCoverImage(articleId: string, file: File, isNew = false): { task: AngularFireUploadTask, ref: AngularFireStorageReference } {
    const storageRef = this.storage.ref(`articleCoverImages/${articleId}`);
    const task = storageRef.put(file);
    return {
      task: task,
      ref: storageRef
    };
  }

  trackUploadedCoverImages(articleId, fullPath, url) {
    const docRef = this.fsdb.doc(`fileUploads/articleUploads/coverImages/${articleId}`);
    docRef.set({ path: fullPath, downloadUrl: url });
  }

  latestArticlesRef(): AngularFirestoreCollection<ArticleDetailPreview> {
    return this.fsdb.collection('articleData/articles/previews', ref => ref.orderBy('timestamp', 'desc').limit(12));
  }

  allArticlesRef(): AngularFirestoreCollection<ArticleDetailPreview> {
    return this.fsdb.collection('articleData/articles/previews', ref => ref.orderBy('lastUpdated', 'desc'));
  }


  watchBookmarkedArticles(userKey) {
    const articleList$ = new BehaviorSubject<ArticleDetailFirestore[]>([]);
    const bookmarksRef = this.rtdb.list(`userInfo/articleBookmarksPerUser/${userKey}`);
    bookmarksRef.snapshotChanges().pipe(map(keySnaps => {
      return keySnaps.map(snap => {
        return this.getPreviewRefById(snap.key).valueChanges();
      })
    })).subscribe(previewObservables => {
      let articleMap = {};
      for (let article$ of previewObservables) {
        article$.subscribe(article => {
          if (!!article) {
            articleMap[article.articleId] = article;
            articleList$.next(Object.values(articleMap));
          }
        });
      }
    });
    return articleList$;
  }


  getArticleRefById(articleId: string): AngularFirestoreDocument<ArticleDetailFirestore> {
    return this.fsdb.doc(`articleData/articles/articles/${articleId}`);
  }

  getPreviewRefById(articleId: string): AngularFirestoreDocument<ArticleDetailPreview> {
    return this.fsdb.doc(`articleData/articles/previews/${articleId}`);
  }

  // This is only used in the article-ppreview-list component that is not currently being used so I did not refactor this yet
  authorRef(uid: string) {
    return this.rtdb.object(`userInfo/open/${uid}`);
  }

  bookmarkedRef(userKey, articleId) {
    return this.rtdb.object(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`);
  }

  unBookmarkArticle(userKey, articleId) {
    this.rtdb.object(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`).remove();
    this.rtdb.object(`articleData/userBookmarksPerArticle/${articleId}/${userKey}`).remove();

  }

  bookmarkArticle(userKey, articleId) {
    this.rtdb
      .object(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.rtdb
      .object(`articleData/userBookmarksPerArticle/${articleId}/${userKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }


  async updateArticle(editor: UserInfoOpen, article, articleId: string) {
    // fsdb reference for article to be updated
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);

    // Updating article version, lastUpdated, and lastEditor
    article.lastUpdated = this.timestampNow;
    article.version++;
    article.lastEditorId = editor.uid;
    return articleRef.update(article);
  }


  createArticle(author: UserInfoOpen, article: ArticleDetailFirestore, articleId) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    article.authorId = author.uid;
    article.articleId = articleId;
    article.lastUpdated = this.timestampNow;
    article.timestamp = this.timestampNow;
    article.lastEditorId = author.uid;
    article.authorImageUrl = author.imageUrl || '../../assets/images/noUserImage.png';

    return articleRef.set(article, { merge: true });
  }


  createArticleId() {
    return this.fsdb.createId();
  }


  deleteArticleRef(articleId) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    articleRef.delete();
  }

  //with refactor this is no longer used
  // arrayFromCollectionSnapshot(querySnapshot: any, shouldAttachId: boolean = false) {
  //   const array = [];
  //   querySnapshot.forEach(doc => {
  //     if (shouldAttachId) {
  //       array.push({ id: doc.id, ...doc.data() });
  //     } else {
  //       array.push(doc.data());
  //     }
  //   });
  //   return array;
  // }

}
