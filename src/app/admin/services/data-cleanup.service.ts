import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DataCleanupService {

  constructor(
    private afdb: AngularFireDatabase,
    private afs: AngularFirestore
  ) { }

  getAllFsUsers() {
    return this.afs.
  }
}
