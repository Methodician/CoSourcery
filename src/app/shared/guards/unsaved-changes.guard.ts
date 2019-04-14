import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { CanDeactivate } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ArticleComponent } from '@components/articles/article/article.component';
import { ConfirmDialogComponent } from '@modals/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ArticleComponent> {

  constructor(
    private dialog: MatDialog
  ) { }

  canDeactivate(component: ArticleComponent): Observable<boolean> | boolean {
    if (component.articleHasUnsavedChanges()) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.data = {
        dialogTitle: 'Unsaved Changes',
        dialogLine1: 'Are you sure you want to leave without saving?',
        dialogLine2: null
      };

      return Observable.create((observer: Observer<boolean>) => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(res => {
          observer.next(res);
          observer.complete();
        }, (err) => {
          observer.next(false);
          observer.complete();
        });
        // Give precedence to component modals
        component.dialogIsOpen.subscribe(res => {
          if (res) {
            dialogRef.close(false);
          }
        });
      });
    } else {
      return true;
    }
  }

}
