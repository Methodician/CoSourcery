import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'cos-edit-timeout',
  templateUrl: './edit-timeout.component.html',
  styleUrls: ['./edit-timeout.component.scss']
})
export class EditTimeoutComponent implements OnInit {

  countDown = 45;
  timeout;

  constructor(public dialogRef: MatDialogRef<EditTimeoutComponent>,
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
