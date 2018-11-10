import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { ArticleDetailPreview } from 'app/shared/class/article-info';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../../modals/login-dialog/login-dialog.component';

@Component({
  selector: 'cos-article-preview-card',
  templateUrl: './article-preview-card.component.html',
  styleUrls: ['./article-preview-card.component.scss']
})

export class ArticlePreviewCardComponent implements OnInit {
  @Input() articleData: ArticleDetailPreview;
  @Input() userId: string;
  isArticleBookmarked: boolean;
  constructor(
    private router: Router,
    private articleSvc: ArticleService,
    private authSvc: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.userId) {
      this.checkIfBookmarked();
    }
  }

  async checkIfBookmarked() {
    const ref = await this.articleSvc.bookmarkedRef(this.userId, this.articleData.articleId);
    ref.valueChanges().subscribe(snapshot => {
      if (snapshot && snapshot.toString().length === 13) {
        this.isArticleBookmarked = true;
      } else {
        this.isArticleBookmarked = false;
      }
    });
  }

  bookmarkToggle() {
    if (this.userId) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.userId, this.articleData.articleId);
      } else {
        this.articleSvc.bookmarkArticle(this.userId, this.articleData.articleId);
      }
    }
  }

  authCheck() {
    if (this.userId) {
      return true;
    } else {
      this.openLoginModal();
      return false;
    }
  }

  openLoginModal() {
    this.dialog.open(LoginDialogComponent);
  }

}
