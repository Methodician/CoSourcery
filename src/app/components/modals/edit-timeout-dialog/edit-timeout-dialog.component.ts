import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'cos-edit-timeout-dialog',
  templateUrl: './edit-timeout-dialog.component.html',
  styleUrls: ['./edit-timeout-dialog.component.scss']
})
export class EditTimeoutDialogComponent implements OnInit {

  countDown = 45;
  timeout;

  constructor(public dialogRef: MatDialogRef<EditTimeoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {editing: boolean}) { }

  ngOnInit() {
    this.timeout = setInterval(() => {
      this.countDown--;
      if (this.countDown === 0) {
        clearInterval(this.timeout);
      }
    }, 1000);
  }

  onNoClick(): void {
    clearInterval(this.timeout);
    this.dialogRef.close(this.data);
  }

  onYesClick(): void {
    clearInterval(this.timeout);
    this.data.editing = true;
    this.dialogRef.close(this.data);
  }

}
