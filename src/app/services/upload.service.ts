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
  uploadPercent: Observable<number>;
  rtdb = firebase.database();
  fsdb = firebase.firestore();
  constructor() {
  }

  async getImageUrl(key, basePath) {
    const snapshot = await this.rtdb.ref(`${basePath}/${key}`).once(`value`);
    if (snapshot && snapshot.val()) {
      const url = snapshot.val().url;
      return url || '../../../assets/images/kid-art.jpg';
    }
    return 'https://www.fillmurray.com/200/300';
  }


  // NEEDS REFACTOR
  async uploadImage(upload: Upload, key, basePath) {
    // delete old file from storage
    // this is not working likely.
    // if (upload.url) {
    //   this.deleteFileStorage(key, basePath);
    // }
    // const filePath = `${basePath}/${key}`;
    // try {
    // const successSnap2 = await this.storage.upload(filePath, upload.file);
    //   const url2 = await successSnap2.ref.getDownloadURL();
    //   upload.url = url2;
    //   upload.size = successSnap2.metadata.size;
    //   upload.type = successSnap2.metadata.contentType;
    //   upload.name = successSnap2.metadata.name;
    //   upload.timeStamp = firebase.database.ServerValue.TIMESTAMP;
    //   upload.progress = null;
    //   this.saveImageData(upload, key, basePath);
    // } catch (err) {
    //   console.log('errors!', err);
    //     alert('There was an error saving this image.');
  }

}
