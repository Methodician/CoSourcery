import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Upload } from '../shared/class/upload';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

import { Observable } from 'rxjs';
import { LoginComponent } from '../components/account/login/login.component';
import { async } from 'rxjs/internal/scheduler/async';

@Injectable()
export class UploadService {
  storage = firebase.storage();
  rtdb = firebase.database();
  fsdb = firebase.firestore();
  constructor() {
  }

  async getImageUrl(uid, basePath) {
    const snapshot = await this.rtdb.ref(`${basePath}/${uid}`).once(`value`);
    if (snapshot && snapshot.val()) {
      const url = snapshot.val().url;
      return url || '../../../assets/images/kid-art.jpg';
    }
    return 'https://www.fillmurray.com/200/300';
  }

  // NEEDS REFACTOR
  uploadImage(upload: Upload, uid, basePath) {
    const storageRef = this.storage.ref(`${basePath}/${uid}`).put(upload.file);
    storageRef.on(firebase.storage.TaskEvent.STATE_CHANGED,
     (uploading) => {
        const snap = storageRef.snapshot;
          upload.progress = ((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0);
     },
    (error) => {
      console.log('error: ', error.message);
      alert(error);
    },
    ()=> {
      storageRef.snapshot.ref.getDownloadURL().then(url => {
        if (basePath === 'uploads/articleCoverImages') {
          this.fsdb.collection(`articleData/articles/articles/`).doc(`${uid}`).update({imgUrl: url});
        } else {
          this.fsdb.doc(`userInfo/open/${uid}`).update({imgUrl: url});
        }
      })
    }
  )
 }


  // NEEDS REFACTOR
  //  async uploadImage(upload: Upload, uid, basePath) {
    // delete old file from storage
    // this is not working likely.
    // if (upload.url) {
    //   this.deleteFileStorage(uid, basePath);
    // }
    // const filePath = `${basePath}/${uid}`;
    // try {
    // const successSnap2 = await this.storage.upload(filePath, upload.file);
    //   const url2 = await successSnap2.ref.getDownloadURL();
    //   upload.url = url2;
    //   upload.size = successSnap2.metadata.size;
    //   upload.type = successSnap2.metadata.contentType;
    //   upload.name = successSnap2.metadata.name;
    //   upload.timeStamp = firebase.database.ServerValue.TIMESTAMP;
    //   upload.progress = null;
    //   this.saveImageData(upload, uid, basePath);
    // } catch (err) {
    //   console.log('errors!', err);
    //     alert('There was an error saving this image.');
  // }

// }
}

