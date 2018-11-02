import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ArticleEditComponent } from 'app/components/articles/article-edit/article-edit.component';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ArticleEditComponent> {
  canDeactivate(
    component: ArticleEditComponent): boolean {


    if (component.articleHasUnsavedChanges()) {
      if (confirm('You have some unsaved changes! To save them, scroll to the bottom and click "Save Article". Want to leave anyway?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
