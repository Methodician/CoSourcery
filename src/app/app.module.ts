import { environment } from 'environments/environment';

// Firebase and AngularFire imports
import * as fb from 'firebase/app';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';

// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

// Angular Material Modules
import {
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatChipsModule,
  MatSidenavModule,
  MatTooltipModule,
  MatTabsModule,
  MatDialogModule,
} from '@angular/material';

// Services
import { ArticleService } from '@services/article.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { UploadService } from '@services/upload.service';
import { UserService } from '@services/user.service';
import { CommentService } from '@services/comment.service';
import { DataCleanupService } from '@admin/services/data-cleanup.service';
import { AdminService } from '@admin/services/admin.service';

// Directives
import { ClickOutDirective } from '@directives/click-out.directive';

// Pipes
import { RelatedArticlePipe } from '@pipes/related-article.pipe';
import { ArticleSearchPipe } from '@pipes/article-search.pipe';
import { ReverseArrayPipe } from '@pipes/reverse-array.pipe';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';
import { SafeUrlPipe } from '@pipes/safe-url.pipe';
import { TimeElapsedPipe } from '@pipes/time-elapsed.pipe';
import { TruncateTagsPipe } from '@pipes/truncate-tags.pipe';
import { TruncateStringPipe } from '@pipes/truncate-string.pipe';

// Components
import { AppComponent } from 'app/app.component';
import { ArticleEditComponent } from '@components/articles/article-edit/article-edit.component';
import { ArticlePreviewCardComponent } from '@components/articles/article-preview-card/article-preview-card.component';
import { CommentComponent } from '@components/comments/comment/comment.component';
import { CommentListComponent } from '@components/comments/comment-list/comment-list.component';
import { DataCleanupComponent } from '@admin/components/data-cleanup/data-cleanup.component';
import { HomeComponent } from '@components/general/home/home.component';
import { ProfileComponent } from '@components/account/profile/profile.component';
import { RegisterComponent } from '@components/account/register/register.component';
import { TopNavComponent } from '@components/general/top-nav/top-nav.component';
import { UnauthorizedComponent } from '@components/general/unauthorized/unauthorized.component';
import { EditTimeoutDialogComponent } from '@modals/edit-timeout-dialog/edit-timeout-dialog.component';
import { LoginDialogComponent } from '@modals/login-dialog/login-dialog.component';
import { MessageDialogComponent } from '@modals/message-dialog/message-dialog.component';
import { ConfirmDialogComponent } from '@modals/confirm-dialog/confirm-dialog.component';
import { ProfileFormComponent } from '@components/account/profile-form/profile-form.component';
import { FilterMenuComponent } from '@components/general/filter-menu/filter-menu.component';
import { ProfileViewComponent } from '@components/account/profile-view/profile-view.component';
import { ProfileContributionsComponent } from '@components/account/profile-contributions/profile-contributions.component';
import { ProfileCardComponent } from '@components/account/profile-card/profile-card.component';
import { ContributorsComponent } from './components/articles/contributors/contributors.component';
import { CoverImageComponent } from './components/articles/article-edit/cover-image/cover-image.component';
import { CoverImageEditComponent } from './components/articles/article-edit/cover-image-edit/cover-image-edit.component';
import { CoverImageDisplayComponent } from './components/articles/article-edit/cover-image-display/cover-image-display.component';
import { FlagArticlesComponent } from './admin/components/flag-articles/flag-articles.component';
import { TitleEditComponent } from './components/articles/article-edit/title/title-edit/title-edit.component';
import { TitleDisplayComponent } from './components/articles/article-edit/title/title-display/title-display.component';
import { TitleComponent } from './components/articles/article-edit/title/title.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    HomeComponent,
    ProfileComponent,
    RegisterComponent,
    ArticleEditComponent,
    ArticlePreviewCardComponent,
    RelatedArticlePipe,
    ArticleSearchPipe,
    ReverseArrayPipe,
    SafeHtmlPipe,
    SafeUrlPipe,
    TimeElapsedPipe,
    TruncateTagsPipe,
    TruncateStringPipe,
    ClickOutDirective,
    CommentListComponent,
    DataCleanupComponent,
    CommentComponent,
    UnauthorizedComponent,
    EditTimeoutDialogComponent,
    LoginDialogComponent,
    MessageDialogComponent,
    ConfirmDialogComponent,
    ProfileFormComponent,
    FilterMenuComponent,
    ProfileViewComponent,
    ProfileContributionsComponent,
    ProfileCardComponent,
    ContributorsComponent,
    CoverImageComponent,
    CoverImageEditComponent,
    CoverImageDisplayComponent,
    FlagArticlesComponent,
    TitleEditComponent,
    TitleDisplayComponent,
    TitleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    MatSidenavModule,
    MatTooltipModule,
    MatTabsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    AngularFireModule.initializeApp(environment.fbConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
  ],
  entryComponents: [
    EditTimeoutDialogComponent,
    LoginDialogComponent,
    MessageDialogComponent,
    ConfirmDialogComponent,
  ],
  providers: [
    AuthService,
    DataCleanupService,
    AdminService,
    UploadService,
    NotificationService,
    ArticleService,
    UserService,
    CommentService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    fb.initializeApp(environment.fbConfig);
    const fs = fb.firestore();
    const settings = { timestampsInSnapshots: true };
    fs.settings(settings);
  }
}
