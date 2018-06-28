import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
//  Docs say to do this - "required for side-effects" whatever that means
// require('firebase/firestore');
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  fsdb: any;

  constructor() {
    this.fsdb = firebase.firestore();
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



  arrayFromCollectionSnapshot(querySnapshot: any, shouldAttachId: boolean = false) {
    const array = [];
    querySnapshot.forEach(doc => {
      if (shouldAttachId)
        array.push({ id: doc.id, ...doc.data() });
      else
        array.push(doc.data());
    })
    return array;
  }   
}
