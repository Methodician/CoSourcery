import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  fsdb = firebase.firestore();
  rtdb = firebase.database();
  bookmarkedArticles$ = new BehaviorSubject<Array<any>>([]);
  timestampNow = firebase.firestore.Timestamp.now();
  currentArticle$ = new Subject<any>();

  constructor(
    private router: Router,
    private storage: AngularFireStorage
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

  async getLatestArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const querySnap = await articlesRef.orderBy('timestamp', 'desc').limit(12).get();
    return this.arrayFromCollectionSnapshot(querySnap);
  }


  async getAllArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const querySnap = await articlesRef.get();
    const articleArray = this.arrayFromCollectionSnapshot(querySnap);

    return articleArray;
  }


  watchBookmarkedArticles(userKey) {
    const bookmarksRef = this.rtdb.ref(`userInfo/articleBookmarksPerUser/${userKey}`);
    bookmarksRef.on('value', articleIds => {
      const articlesList = new Array<any>();
      articleIds.forEach(key => {
        this.getArticleById(key.key).then(article => {
          articlesList.push(article);
          this.bookmarkedArticles$.next(articlesList);
        });
      });
    });
  }


  async getArticleById(articleId: string) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    const docSnapshot = await articleRef.get();
    return docSnapshot.data();
  }


  async getAuthor(uid: string) {
    const userRef = this.rtdb.ref(`userInfo/open/${uid}`);
    const userInfoSnapshot = await userRef.once('value');
    return userInfoSnapshot.val();

  }


  async isBookmarked(userKey, articleId) {
    const ref = this.rtdb.ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`);

    const snapshot = await ref.once('value');
    const val = snapshot.val();
    // Checks if snapshot returns a timestamp
    if (val && val.toString().length === 13) {
      return true;
    } else {
      return false;
    }
  }


  async setCurrentArticle(articleId: string) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
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
    const bpu = this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`);
    bpu.remove();
    const upb = this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleId}/${userKey}`);
    upb.remove();

  }

  bookmarkArticle(userKey, articleId) {
    this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleId}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleId}/${userKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }


  async updateArticle(editor: UserInfoOpen, article, articleId: string) {
    // fsdb reference for article to be updated
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);

    // Updating article version, lastUpdated, and lastEditor
    article.lastUpdated = this.timestampNow;
    article.version++;
    article.lastEditorId = editor.uid;
    let outcome = 'success';
    articleRef.update(article).catch(error => {
      if (error) {
        outcome = 'Error';
      }
    });
    if (outcome !== 'success') {
      return outcome;
    }
    // this.navigateToArticleDetail(article.articleId);
    return outcome;
  }


  createArticle(author: UserInfoOpen, article: ArticleDetailFirestore, articleId) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    // Updating New Article Object.
    // Probably a better way to do this.
    const newArt = article;
    newArt.authorId = author.uid,
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
      articleRef.update(newArt)
        .then(() => {
          this.navigateToArticleDetail(articleId);
        });
    } catch (error) {
      console.error(error);
      outcome = 'Error (logged to console)';
    }
    return outcome;
  }


  createArticleId() {
    // Creates new document reference point in fsdb
    const articleIDRef = this.fsdb.collection(`articleData/articles/articles/`).doc();
    // Saves the ID of new article reference point
    return articleIDRef.id;
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
