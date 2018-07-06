import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { GlobalTag, ArticleDetailFirestore, ArticleBodyFirestore } from 'app/shared/class/article-info';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { error } from 'util';
import { NotificationService } from '../services/notification.service';


//  Docs say to do this - "required for side-effects" whatever that means
// require('firebase/firestore');
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  globalTags: Iterable<GlobalTag>;
  fsdb: any;
  rtdb: any;
  constructor(private router: Router, private notifSvc: NotificationService) {
    // this.primeTags();
    this.fsdb = firebase.firestore();
    this.rtdb = firebase.database();
  }

  async getAllArticles() {
    const querySnap = await this.fsdb.collection('articleData/articles/articles').get();
    return this.arrayFromCollectionSnapshot(querySnap);
  }

  async getLatestArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const query = articlesRef.orderBy('timestamp', 'desc').limit(12);
    const querySnap = await query.get();
    return this.arrayFromCollectionSnapshot(querySnap);
    // querySnapshot.forEach(doc => {
    //   console.log(`${doc.id} ==> ${doc.data()}`);
    // });
  }

  fsServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getGlobalTags() {
    return this.fsdb.doc('articleData/tags');
  }

  getArticleRef(articleId) {
    return this.fsdb.doc(`articleData/articles/articles/${articleId}`);
  }

  async getFeaturedArticles() {
    const articlesRef = this.fsdb.collection('articleData/articles/articles');
    const query = articlesRef.where('isFeatured', '==', true);
    return this.arrayFromCollectionSnapshot(await query.get());
  }

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

    captureArticleUnView(articleId: string, viewId: string) {
    // TOUGH: Not registered when browser refreshed or closed or navigate away from app.
    // Consider using beforeUnload S/O article:
    // https://stackoverflow.com/questions/37642589/how-can-we-detect-when-user-closes-browser/37642657#37642657
    // Consider using session storage as started in captureAricleView - maybe can reliably track viewId and timing or something...
    const viewFromSession = new Date(sessionStorage.getItem(`unView:${articleId}`));
    const msPerMinute = 60000;
    const twoMinutesBack = new Date(new Date().valueOf() - 2 * msPerMinute);
    if (viewFromSession < twoMinutesBack) {
      sessionStorage.setItem(`unView:${articleId}`, new Date().toString());
      const articleDoc = this.getArticleRef(articleId);
      return articleDoc.collection('views').doc(viewId).update({
        viewEnd: this.fsServerTimestamp()
        // viewEnd: new Date()
      });
    }
  }

  bookmarkArticle(userKey, articleKey) {
    this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
    this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleKey}/${userKey}`)
      .set(firebase.database.ServerValue.TIMESTAMP);
  }

  unBookmarkArticle(userKey, articleKey) {
    this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`)
      .remove();
    this.rtdb
      .ref(`articleData/userBookmarksPerArticle/${articleKey}/${userKey}`)
      .remove();
  }

   getAuthor(uid: string) {
    return this.rtdb.ref(`userInfo/open/${uid}`).once(`value`).then(data => {
      return data.val();
    });
  }

   isBookmarked(userKey, articleKey) {
    return this.rtdb
      .ref(`userInfo/articleBookmarksPerUser/${userKey}/${articleKey}`).once(`value`).then(article => {
        console.log('AS Line 84', article);
        return article ? true : false;
      });
      // .valueChanges()
      // .pipe(map(article => {
      //   return article ? true : false;
      // }));
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
  navigateToArticleDetail(articleKey: any) {
    this.router.navigate([`articledetail/${articleKey}`]);
  }
  navigateToProfile(uid: any) {
    this.router.navigate([`profile/${uid}`]);
  }


  unFeatureArticle(articleKey: string) {
    this
      .getArticleRef(articleKey)
      .update({ isFeatured: false });
  }


  // Needs Refactoring.
  // primeTags() {
  //   if (!this.globalTags) {
  //     const tagsRef = this.getGlobalTags();
  //     tagsRef.valueChanges()
  //       .subscribe((tags: any) => {
  //         if (tags) {
  //           this.globalTags = tags;
  //           // resolve();
  //         } else {
  //           console.log('tried to re-seed the data');
            // this is running unexpectedly
            // const seedTag: any = {
            //   seed: {
            //     count: 0,
            //     timestamp: new Date()
            //   }
            // }
            // tagsRef.set(seedTag)
            //   .then(() => {
            //     // resolve();
            //   })
            //   .catch((err) => {
            //     alert(`
            //       No tags exist and we can't make them.
            //       Is this a new DB instance?
            //       Please send a screenshot of this error to the Scatterschool Dev Team!:
            //       ${err.toString()}
            //     `);
            //   });
          }
