import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireDatabase, AngularFireObject} from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  vanillaFsdb = firebase.firestore();
  vanillaRtdb = firebase.database();
  bookmarkedArticles$ = new BehaviorSubject<Array<any>>([]);
  timestampNow = firebase.firestore.Timestamp.now();
  currentArticle$ = new Subject<any>();

  constructor(
    private router: Router,
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
    const docRef = this.vanillaFsdb.doc(`fileUploads/articleUploads/coverImages/${articleId}`);
    docRef.set({ path: fullPath, downloadUrl: url });
  }

  async latestArticlesRef() {
    return this.fsdb.collection('articleData/articles/articles', ref => ref.orderBy('timestamp', 'desc').limit(12)).valueChanges();
  }

  async allArticlesRef() {
    return this.fsdb.collection('articleData/articles/articles').valueChanges();
  }


  watchBookmarkedArticles(userKey) {
    const bookmarksRef = this.rtdb.list(`userInfo/articleBookmarksPerUser/${userKey}`).snapshotChanges();
    bookmarksRef.subscribe(articleIds => {
      const articlesList = new Array<any>();
      articleIds.forEach(async key => {
        const articleRef= await this.getArticleById(key.key);
        articleRef.subscribe(article => {
          articlesList.push(article);
          this.bookmarkedArticles$.next(articlesList);
        });
      });
    });
  }


  async getArticleById(articleId: string) {
    return this.fsdb.doc(`articleData/articles/articles/${articleId}`).valueChanges();
  }

// This is only used in the article-ppreview-list component that is not currently being used so I did not refactor this yet
  async getAuthor(uid: string) {
    return this.rtdb.object(`userInfo/open/${uid}`).valueChanges();
  }


  async bookmarkedRef(userKey, articleId) {
    return this.rtdb.object(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`).valueChanges();
  }


  async setCurrentArticle(articleId: string) {
    const articleRef = this.vanillaFsdb.doc(`articleData/articles/articles/${articleId}`);
    await articleRef.onSnapshot(snapshotData => {
      const selectedArticle = snapshotData.data();
      this.currentArticle$.next(selectedArticle);
    });
  }


  navigateToArticleDetail(articleId: any) {
    this.router.navigate([`articledetail/${articleId}`]);
  }

  navigateToProfile(uid: any) {
    this.router.navigate([`profile/${uid}`]);
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
    // vanillaFsdb reference for article to be updated
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);

    // Updating article version, lastUpdated, and lastEditor
    article.lastUpdated = this.timestampNow;
    article.version++;
    article.lastEditorId = editor.uid;
    return articleRef.update(article);
  }


  createArticle(author: UserInfoOpen, article: ArticleDetailFirestore, articleId) {
    const articleRef = this.vanillaFsdb.doc(`articleData/articles/articles/${articleId}`);
    // Updating New Article Object.
    // Probably a better way to do this.
    console.log(article);
    const newArt = article;
    newArt.authorId = author.uid;
    newArt.articleId = articleId;
    newArt.commentCount = 0;
    newArt.version = 1;
    newArt.viewCount = 0;
    newArt.lastUpdated = this.timestampNow;
    newArt.timestamp = this.timestampNow;
    newArt.lastEditorId = author.uid;
    newArt.authorImageUrl = author.imageUrl || '../../assets/images/noUserImage.png';

    let outcome = 'success';
    try {
      articleRef.set(newArt, {merge: true});
    } catch (error) {
      console.error(error);
      outcome = 'Error (logged to console)';
    }
    return outcome;
  }


  createArticleId() {
    return this.fsdb.createId();
  }


  deleteArticleRef(articleId) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    articleRef.delete();
  }


  arrayFromCollectionSnapshot(querySnapshot: any, shouldAttachId: boolean = false) {
    const array = [];
    querySnapshot.forEach(doc => {
      if (shouldAttachId) {
        array.push({ id: doc.id, ...doc.data() });
      } else {
        array.push(doc.data());
      }
    });
    return array;
  }

}
