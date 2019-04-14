import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import { Upload } from '@class/upload';

@Injectable()
export class UploadService {
  storage = firebase.storage();
  rtdb = firebase.database();
  fsdb = firebase.firestore();
  constructor() {}

  uploadArticleCoverImage(
    upload: Upload,
    articleId: string,
    newStatus?: boolean,
  ) {
    const storageRef = this.storage.ref(
      `uploads/articleCoverImages/${articleId}`,
    );
    const task = storageRef.put(upload.file);

    task.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      async () => {
        const snap = task.snapshot;
        upload.progress = (
          (snap.bytesTransferred / snap.totalBytes) *
          100
        ).toFixed(0);
        const url = await storageRef.getDownloadURL();
        const docRef = this.fsdb.doc(
          `articleData/articles/articles/${articleId}`,
        );
        const imageUrl = { imageUrl: url };
        if (newStatus) {
          docRef.set(imageUrl);
          return url;
        }
        docRef.update(imageUrl);
        return url;
      },
      error => {
        console.error(error);
        alert('trouble uploading the image ' + error.message);
      },
      () => {
        // console.log('article image upload success');
      },
    );
  }

  // NEEDS REFACTOR
  uploadImage(upload: Upload, uid, basePath, newStatus?: boolean) {
    const storageRef = this.storage.ref(`${basePath}/${uid}`).put(upload.file);
    storageRef.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        const snap = storageRef.snapshot;
        upload.progress = (
          (snap.bytesTransferred / snap.totalBytes) *
          100
        ).toFixed(0);
        snap.ref.getDownloadURL().then(url => {
          if (basePath === 'uploads/articleCoverImages/') {
            if (newStatus === true) {
              this.fsdb
                .collection(`articleData/articles/articles/`)
                .doc(`${uid}`)
                .set({ imageUrl: url });
              return url;
            } else if (newStatus === false) {
              this.fsdb
                .collection(`articleData/articles/articles/`)
                .doc(`${uid}`)
                .update({ imageUrl: url });
              return url;
            }
          } else {
            if (newStatus === true) {
              this.rtdb.ref(`userInfo/open/${uid}`).set({ imageUrl: url });
              return url;
            } else {
              this.rtdb.ref(`userInfo/open/${uid}`).update({ imageUrl: url });
              return url;
            }
          }
        });
      },
      error => {
        console.log('error: ', error.message);
        alert(error);
      },
      () => {
        console.log('image upload success');
      },
    );
  }
}
