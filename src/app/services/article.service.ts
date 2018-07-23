import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { GlobalTag, ArticleDetailFirestore } from 'app/shared/class/article-info';
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
  timestampNow = firebase.firestore.Timestamp.now();

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
    // TEMP Remove after bodyId no longer needed.
    if (article.bodyId !== '') {
      const body = await this.getArticleBody(article.bodyId);
      article.body = body.body;
    }
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


  // REFACTOR REQUIRED
  async updateArticle(editorId: string, editor: UserInfoOpen, article: ArticleDetailFirestore, articleId: string) {

  // fsdb reference for article to be updated
  const articleRef = this.fsdb.doc(`articleData/articles/articles/${articleId}`);
  // Reference for editor info to be save at
  const editorRef = this.fsdb.doc(`articleData/articles/articles/${articleId}/editors/${editorId}`);
  // Reference of for preview to be updated
  const articlePreviewRef = this.fsdb.doc(`articleData/articles/previews/${articleId}`);
  // Reference for position to archive previous version at
  const archiveRef = this.fsdb.doc(`articleData/articles/articles/${articleId}/history/${article.version}`);

  // Retreive and update old article
  const articleSnap = await articleRef.get();
  const oldArticle = articleSnap.data();
  oldArticle.lastUpdated = this.timestampNow;

  // Save for now just in case
  // const articlePreviousVersionSnapshot = articleRef.get().then(snapshot => {
  //   const updateArticleObject = {
  //     authorId: snapshot.data().authorId,
  //     bodyId: snapshot.data().bodyId,
  //     title: snapshot.data().title,
  //     introduction: snapshot.data().introduction,
  //     lastUpdated: this.timestampNow;
  //     timestamp: snapshot.data().timestamp,
  //     version: snapshot.data().version,
  //     commentCount: snapshot.data().commentCount,
  //     tags: snapshot.data().tags,
  //     body: snapshot.data().body,
  //     articleId: snapshot.data().articleId,
  //     inFeatured: snapshot.data().isFeatured,
  //     lastEditorId: editorId,
  //   };
  //   console.log('updateArticleObject 233', updateArticleObject);

  //   return updateArticleObject;
  // });



  // Updating article version and lastUpdated
  article.lastUpdated = this.timestampNow;
  article.version ++;

  // Editor info object to be saved
  const editorObject = {editorID: editorId, name: editor.fName + ' ' + editor.lName };

  // Preview info object to be updated
  const previewObject = {
    id: articleId,
    authorId: article.authorId,
    title: article.title,
    introduction: article.introduction,
    lastUpdated:  this.timestampNow,
    timestamp: this.timestampNow,
    version: article.version,
    commentCount: 0,
    viewCount: 0,
    tags: article.tags,
    imgUrl: article.imgUrl,
    imgAltL: article.imgAlt,
  };

  articleRef.update(article);
  editorRef.set(editorObject);
  articlePreviewRef.set(previewObject);
  archiveRef.set(oldArticle);

  // For Testing
  console.log('updated article', article);
  console.log('updated preview object', previewObject );
  console.log('updated editor object', editorObject);
  console.log('oldArt', oldArticle);
  console.log('updated article version', article.version);

  }

  createArticle(authorId: string, author: UserInfoOpen, article: ArticleDetailFirestore) {
    // Creates new document reference point in fsdb
    const articleIDRef = this.fsdb.collection(`articleData/articles/articles/`).doc();
    // Saves the ID of new article reference point
    const artId = articleIDRef.id;
    // More specific ref to new article
    const articleRef = this.fsdb.doc(`articleData/articles/articles/${artId}`);
    // Creates new document ref for preview of new article with same id
    const articlePreviewIdRef = this.fsdb.doc(`articleData/articles/previews/${artId}`);
    // Creates a ref for saving the editor info for the new article
    const editorRef = this.fsdb.doc(`articleData/articles/articles/${artId}/editors/${authorId}`);

    // Info to be saved in editor document
    const editorObject = {editorID: author.$key, name: author.fName + ' ' + author.lName };

    // Info to be saved in Preview document
    const previewObject = {
      id: artId,
      authorId: author.$key,
      title: article.title,
      introduction: article.introduction,
      lastUpdated:  this.timestampNow,
      timestamp: this.timestampNow,
      version: 1,
      commentCount: 0,
      viewCount: 0,
      tags: article.tags,
      imgUrl: article.imgUrl,
      imgAlt: article.imgAlt
    };

    // Updating New Article Object.
    // Probably a better way to do this.
    const newArt = article;
    newArt.authorId = author.$key,
    newArt.articleId = artId;
    newArt.commentCount = 0;
    newArt.version = 1;
    newArt.viewCount = 0;
    newArt.lastUpdated = this.timestampNow;
    newArt.timestamp = this.timestampNow;
    newArt.imgUrl = article.imgUrl || 'none';
    newArt.imgAlt = article.imgAlt || 'none';

    // for testing
    console.log('created preview object', previewObject);
    console.log('created new article', newArt);
    console.log('created editor object', editorObject);


articlePreviewIdRef.set(previewObject);
articleRef.set(newArt);
editorRef.set(editorObject);
    // return 'success';
  }

}
