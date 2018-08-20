import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Upload } from '../shared/class/upload';

@Injectable()
export class UploadService {
  storage = firebase.storage();
  rtdb = firebase.database();
  fsdb = firebase.firestore();
  constructor() {
  }


  // NEEDS REFACTOR
  uploadImage(upload: Upload, uid, basePath) {
    const storageRef = this.storage.ref(`${basePath}/${uid}`).put(upload.file);
    storageRef.on(firebase.storage.TaskEvent.STATE_CHANGED,
     () => {
        const snap = storageRef.snapshot;
          upload.progress = ((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0);
        snap.ref.getDownloadURL().then(url => {
          if (basePath === 'uploads/articleCoverImages/') {
            this.fsdb.collection(`articleData/articles/articles/`).doc(`${uid}`).set({imageUrl: url});
            return url;
          } else {
            this.rtdb.ref(`userInfo/open/${uid}`).set({imageUrl: url});
            return url;
          }
        });
     },
    (error) => {
      console.log('error: ', error.message);
      alert(error);
    },
    () => {
      console.log('image upload success');
    }
  );
 }




}

