import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'cos-edit-timeout',
  templateUrl: './edit-timeout.component.html',
  styleUrls: ['./edit-timeout.component.scss']
})
export class EditTimeoutComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EditTimeoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {editing: boolean}) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

  onYesClick(): void {
    this.data.editing = true;
    this.dialogRef.close(this.data);
  }

}
