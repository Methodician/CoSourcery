import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArticleDetailFirestore, ArticleDetailPreview } from 'app/shared/class/article-info';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';
import * as algoliasearch from 'algoliasearch/lite';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  searchedArticles$ = new BehaviorSubject<ArticleDetailPreview[]>([]);
  fsServerTimestamp = firebase.firestore.FieldValue.serverTimestamp();
  dbServerTimestamp = firebase.database.ServerValue.TIMESTAMP;
  algoliaClient = algoliasearch('7EELIYF04C', 'bb88a22504c5bc1a1f0ca58c7763a2b2');

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
    return { task: task, ref: storageRef };
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
    const articleList$ = new BehaviorSubject<ArticleDetailPreview[]>([]);
    const bookmarksRef = this.rtdb.list(`userInfo/articleBookmarksPerUser/${userKey}`);
    bookmarksRef.snapshotChanges().pipe(map(keySnaps => {
      return keySnaps.map(snap => {
        return this.getPreviewRefById(snap.key).valueChanges();
      });
    })).subscribe(previewObservables => {
      const articleMap = {};
      if (previewObservables.length > 0) {
        for (const article$ of previewObservables) {
          article$.subscribe(article => {
            if (!!article) {
              articleMap[article.articleId] = article;
              articleList$.next(Object.values(articleMap));
            }
          });
        }
      } else {
        articleList$.next(Object.values(articleMap));
      }

    });
    return articleList$;
  }

  getArticlesByAuthorId(authorId: string): AngularFirestoreCollection<ArticleDetailPreview> {
    return this.fsdb.collection('articleData/articles/previews', ref => ref.where('authorId', '==', authorId));
  }

  getArticleIdsByEditorId(editorId: string) {
    return this.rtdb.object(`userInfo/articlesEditedPerUser/${editorId}`).valueChanges();
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
      .set(this.dbServerTimestamp);
    this.rtdb
      .object(`articleData/userBookmarksPerArticle/${articleId}/${userKey}`)
      .set(this.dbServerTimestamp);
  }


  updateArticle(editor: UserInfoOpen, article, articleId: string) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);

    const editors = article.editors || {};
    const editCount = editors[editor.uid] || 0;
    editors[editor.uid] = editCount + 1;

    const changedArticle = { ...article };
    changedArticle.lastUpdated = this.fsServerTimestamp;
    changedArticle.version++;
    changedArticle.lastEditorId = editor.uid;
    changedArticle.editors = editors;
    return articleRef.update(changedArticle);
  }


  createArticle(author: UserInfoOpen, article: ArticleDetailFirestore, articleId) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    article.editors = {};
    article.editors[author.uid] = 1;
    article.authorId = author.uid;
    article.articleId = articleId;
    article.lastUpdated = this.fsServerTimestamp;
    article.timestamp = this.fsServerTimestamp;
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

  async searchArticles(query) {
    const articleList = new Array<any>();
    this.searchedArticles$.next(articleList);
    const index = this.algoliaClient.initIndex(environment.algoliaIndex);
    const searchResults = await index.search({
      query: query,
      attributesToRetrieve: ['objectId'],
      hitsPerPage: 50
    });
    if (searchResults.hits.length > 0) {
      const articleIds = [];
      searchResults.hits.forEach(article => { // creates array of articleIds from search results
        articleIds.push(article.objectID);
      });
      articleIds.forEach(key => { // creates array of articlePreviews
        this.getPreviewRefById(key).valueChanges().subscribe(article => {
          if (article) {
            articleList.push(article);
          }
        });
      });
    }
    this.searchedArticles$.next(articleList);
  }

  setArticleEditStatus(articleId: string, editorId: string) {
    // onDisconnect not available in AngularFire2 so using vanilla db
    // Solution looks overcomplicated because it is.
    // Future-proofing for case where we allow multiple concurrent editors of single article (gDocs style)
    // Also allowing for one person to have multiple tabs open and be editing multiple articles
    const editorsByArticlePath = `articleData/editStatus/editorsByArticle/${articleId}/${editorId}`;
    const articlesByEditorPath = `articleData/editStatus/articlesByEditor/${editorId}/${articleId}`;
    const updates = {}
    const editorsRef = this.rtdb.database.ref(editorsByArticlePath);
    const articlesRef = this.rtdb.database.ref(articlesByEditorPath);
    updates[editorsByArticlePath] = true;
    updates[articlesByEditorPath] = true;

    this.rtdb.database.ref().update(updates);

    editorsRef.onDisconnect().set(null);
    articlesRef.onDisconnect().set(null);
  }

  removeArticleEditStatus(articleId: string, editorId: string) {
    const editorByArticlePath = `articleData/editStatus/editorsByArticle/${articleId}/${editorId}`;
    const articleByEditorPath = `articleData/editStatus/articlesByEditor/${editorId}/${articleId}`;
    const updates = {}
    updates[editorByArticlePath] = null;
    updates[articleByEditorPath] = null;
    this.rtdb.database.ref().update(updates);
  }

  getEditorsByArticleRef(articleId: string): AngularFireList<boolean> {
    return this.rtdb.list(`articleData/editStatus/editorsByArticle/${articleId}`);
  }

  // with refactor this is no longer used
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
