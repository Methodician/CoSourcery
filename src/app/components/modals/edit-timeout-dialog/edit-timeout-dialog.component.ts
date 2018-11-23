import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'cos-edit-timeout-dialog',
  templateUrl: './edit-timeout-dialog.component.html',
  styleUrls: ['./edit-timeout-dialog.component.scss']
})
export class EditTimeoutDialogComponent implements OnInit {

  responseTimer;
  responseWaitTime: number = 60;
  editorIsActive: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<EditTimeoutDialogComponent>
  ) { }

  ngOnInit() {
    this.responseTimer = setInterval(() => {
      this.responseWaitTime--;
      if (this.responseWaitTime <= 0) {
        clearInterval(this.responseTimer);
        this.dialogRef.close(this.editorIsActive);
      }
    }, 1000);
  }

  onSelectNo(): void {
    clearInterval(this.responseTimer);
    this.dialogRef.close(this.editorIsActive);
  }

  onSelectYes(): void {
    clearInterval(this.responseTimer);
    this.editorIsActive = true;
    this.dialogRef.close(this.editorIsActive);
  }

}
