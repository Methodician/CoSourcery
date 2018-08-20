import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { UserInfoOpen } from 'app/shared/class/user-info';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  fsdb = firebase.firestore();
  rtdb = firebase.database();
  bookmarkedArticles$ = new BehaviorSubject<Array<any>>([]);
  timestampNow = firebase.firestore.Timestamp.now();
  currentArticle$ = new Subject<any>();

  constructor(private router: Router) {

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


  async setCurrentArticle(articleId: string) {
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
    const docSnapshot = await articleRef.get();
    const articleData = docSnapshot.data();
    this.currentArticle$.next(articleData);
  }


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


  async updateArticle(editor: UserInfoOpen, article, articleId: string) {
    // fsdb reference for article to be updated
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);

    // Updating article version, lastUpdated, and lastEditor
    article.lastUpdated = this.timestampNow;
    article.version ++;
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
    this.navigateToArticleDetail(article.articleId);
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
    newArt.authorImageUrl = author.imageUrl || '../../assets/images/noUserImage.png' ;

    let outcome = 'success';
    articleRef.update(newArt).catch(error => {
      if (error) {
        console.log(error);
        outcome = 'Error';
      }
    });
    if (outcome !== 'success') {
      return outcome;
    }
    this.navigateToArticleDetail(article.articleId);
    return outcome;
  }

  // created new article ref to be passed to upload service
  createArticleId() {
    // Creates new document reference point in fsdb
    const articleIDRef = this.fsdb.collection(`articleData/articles/articles/`).doc();
    // Saves the ID of new article reference point
    const articleId = articleIDRef.id;
    return articleId;
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

 // Unused logic for one and future(?) functionality.
 // Delete if unwanted.


 // async getFeaturedArticles() {
  //   const articlesRef = this.fsdb.collection('articleData/articles/articles');
  //   const query = articlesRef.where('isFeatured', '==', true);
  //   const collectionSnapshot = await query.get();
  //   const articleArray = this.arrayFromCollectionSnapshot(collectionSnapshot);
  //   console.log('article array Fetured ArtSvc 43', articleArray);

  //   return articleArray;
  // }

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
