import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { GlobalTag, ArticleDetailFirestore, ArticleBodyFirestore } from 'app/shared/class/article-info';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { error } from 'util';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  // globalTags: Iterable<GlobalTag>;
  fsdb = firebase.firestore();
  rtdb = firebase.database();
  bookmarkedArticles$ = new BehaviorSubject<Array<any>>([]);

  constructor(private router: Router, private notifSvc: NotificationService) {
    //  primeTags() should be fixed or eliminated
    // this.primeTags();
  }

  async getAllArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const querySnap = await articlesRef.get();
    const articleArray = this.arrayFromCollectionSnapshot(querySnap);

    return articleArray;
  }

  watchBookmarkedArticles(userKey) {
    const bookmarksRef = this.rtdb.ref(`userInfo/articleBookmarksPerUser/${userKey}`);
    bookmarksRef.on('value', articleKeys => {
      const articlesList = new Array<any> ();
      articleKeys.forEach(key => {
          this.getArticleById(key.key).then(article => {
          articlesList.push(article);
          this.bookmarkedArticles$.next(articlesList);
        });
      });
  });
  }

  getArticleUpdateTime(articleId) {
    let date: Date = new Date();
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    articleRef.get().then(articleData => {
      date = articleData.data().lastUpdated.toDate().toString();
    });
    return date;
  }

  getArticleTimeStampTime(articleId) {
    let date: Date = new Date();
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    articleRef.get().then(articleData => {
      date = articleData.data().timestamp.toDate().toString();
    });
    return date;
  }

  async getLatestArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const querySnap = await articlesRef.orderBy('timestamp', 'desc').limit(12).get();
    return this.arrayFromCollectionSnapshot(querySnap);
  }

  // async getFeaturedArticles() {
  //   const articlesRef = this.fsdb.collection('articleData/articles/articles');
  //   const query = articlesRef.where('isFeatured', '==', true);
  //   const collectionSnapshot = await query.get();
  //   const articleArray = this.arrayFromCollectionSnapshot(collectionSnapshot);
  //   console.log('article array Fetured ArtSvc 43', articleArray);

  //   return articleArray;
  // }

  async getArticleById(articleId: string) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    const docSnapshot = await articleRef.get();
    return docSnapshot.data();
  }

  async getArticleBody(bodyId: string) {
    const articleRef = this.fsdb.doc(`articleData/bodies/active/${bodyId}`);
    const docSnapshot = await articleRef.get();
    return docSnapshot.data();
  }

  async getFullArticleById(articleId: string) {
    const article = await this.getArticleById(articleId);
    const body = await this.getArticleBody(article.bodyId);
    article.body = body.body;
    return article;
  }

  async getAuthor(uid: string) {
    const userRef = this.rtdb.ref(`userInfo/open/${uid}`);
    const userInfoSnapshot = await userRef.once('value');
    return userInfoSnapshot.val();

  }

  async isBookmarked(userKey, articleKey) {
    const ref = this.rtdb.ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`);

    const snapshot = await ref.once('value');
    const val = snapshot.val();
    // Checks if snapshot returns a timestamp
    if (val && val.toString().length === 13) {
      return true;
    } else {
      return false;
    }
  }



  // async getGlobalTags() {
  //   const tagsSnapshot = await this.fsdb.doc('articleData/tags').get();
  //   return tagsSnapshot.data();
  // }

  // captureArticleUnView(articleId: string, viewId: string) {
  //   // TOUGH: Not registered when browser refreshed or closed or navigate away from app.
  //   // Consider using beforeUnload S/O article:
  //   // https://stackoverflow.com/questions/37642589/how-can-we-detect-when-user-closes-browser/37642657#37642657
  //   // Consider using session storage as started in captureAricleView - maybe can reliably track viewId and timing or something...
  //   // Consider using Cloud Functions or use presence scheme
  //   const viewFromSession = new Date(sessionStorage.getItem(`unView:${articleId}`));
  //   const msPerMinute = 60000;
  //   const twoMinutesBack = new Date(new Date().valueOf() - 2 * msPerMinute);
  //   if (viewFromSession < twoMinutesBack) {
  //     sessionStorage.setItem(`unView:${articleId}`, new Date().toString());
  //     const articleDocRef = this.getArticleRef(articleId);
  //     return articleDocRef.collection('views').doc(viewId).update({
  //       viewEnd: this.fsServerTimestamp()
  //       // viewEnd: new Date()
  //     });
  //   }
  // }

  navigateToArticleDetail(articleKey: any) {
    this.router.navigate([`articledetail/${articleKey}`]);
  }

  navigateToProfile(uid: any) {
    this.router.navigate([`profile/${uid}`]);
  }


  unBookmarkArticle(userKey, articleKey) {
    const bpu = this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`);
    bpu.remove();
    const upb = this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleKey}/${userKey}`);
    upb.remove();

  }

  bookmarkArticle(userKey, articleKey) {
    this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleKey}/${userKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }

  // featureArticle(articleKey: string, authorKey: string) {
  //   this
  //     .getArticleRef(articleKey)
  //     .update({ isFeatured: true });
  //   this.notifSvc.createFeatureNotification(authorKey);
  // }

  // unFeatureArticle(articleKey: string) {
  //   this
  //     .getArticleRef(articleKey)
  //     .update({ isFeatured: false });
  // }

  fsServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getArticleRef(articleId) {
    return this.fsdb.doc(`articleData/articles/articles/${articleId}`);
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

  // getArticlesPerTag(tagArr) {
  //   const articlesArray = [];
  //   tagArr.map(tag => {
  //     this.rtdb.ref(`articleData/articlesPerTag/${tag}`).once(`value`)
  //       .then(result => {
  //         const tags = result.val();
  //         if (tags.length > 1) {
  //           tags.map(obj => {
  //             articlesArray.push(obj.key);
  //           });
  //         }
  //       });
  //   });
  //   return articlesArray;
  // }


  // MASSIVE REFACTOR REQUIRED
  updateArticle(editorId: string, editor: UserInfoOpen, article: ArticleDetailFirestore, articleId: string) {

  }

}
