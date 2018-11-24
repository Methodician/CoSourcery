import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'cos-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  messageTitle: string;
  messageLine1: string;
  messageLine2: string;

  constructor(
    private dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      messageTitle: string,
      messageLine1: string,
      messageLine2: string
    }
  ) {
    this.messageTitle = data.messageTitle ? data.messageTitle : 'Message Title';
    this.messageLine1 = data.messageLine1 ? data.messageLine1 : 'Message Line 1';
    this.messageLine2 = data.messageLine2 ? data.messageLine2 : null;
  }

  onConfirm() {
    this.dialogRef.close();
  }

}
