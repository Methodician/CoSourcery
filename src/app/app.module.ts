import { environment } from 'environments/environment';

// Firebase and AngularFire imports
import * as fb from 'firebase/app';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';

// general
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UploadService } from './services/upload.service';
import { ArticleService } from './services/article.service';
import { NotificationService } from './services/notification.service';
import { UserService } from './services/user.service';

// Material and Associated Imports
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
  MatDialogModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'app/app-routing.module';
import { AppComponent } from 'app/app.component';
import { TopNavComponent } from 'app/components/general/top-nav/top-nav.component';
import { LoginComponent } from 'app/components/account/login/login.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { AccountComponent } from 'app/components/account/account/account.component';
import { FollowedUserComponent } from 'app/components/account/followed-user/followed-user.component';
import { FollowerUserComponent } from 'app/components/account/follower-user/follower-user.component';
import { ProfileComponent } from 'app/components/account/profile/profile.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleRelatedComponent } from 'app/components/articles/article-related/article-related.component';
import { ArticleEditComponent } from 'app/components/articles/article-edit/article-edit.component';
import { ArticleSearchResultsComponent } from 'app/components/articles/article-search-results/article-search-results.component';
import { ArticlePreviewCardComponent } from 'app/components/articles/article-preview-card/article-preview-card.component';
import { ArticlePreviewListComponent } from 'app/components/articles/article-preview-list/article-preview-list.component';
import { UploadFormComponent } from 'app/components/shared/upload-form/upload-form.component';
import { RelatedArticlePipe } from './shared/pipes/related-article.pipe';
import { ArticleSearchPipe } from './shared/pipes/article-search.pipe';
import { ReverseArrayPipe } from './shared/pipes/reverse-array.pipe';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { SafeUrlPipe } from './shared/pipes/safe-url.pipe';
import { TimeElapsedPipe } from './shared/pipes/time-elapsed.pipe';
import { TruncateTagsPipe } from './shared/pipes/truncate-tags.pipe';
import { TruncateStringPipe } from './shared/pipes/truncate-string.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClickOutDirective } from './directives/click-out.directive';
import { CommentListComponent } from './components/comments/comment-list/comment-list.component';
import { CommentService } from './services/comment.service';
import { DataCleanupComponent } from './admin/components/data-cleanup/data-cleanup.component';
import { DataCleanupService } from './admin/services/data-cleanup.service';
import { CommentComponent } from './components/comments/comment/comment.component';
import { UnauthorizedComponent } from './components/general/unauthorized/unauthorized.component';
import { EditTimeoutComponent } from './components/shared/dialogs/edit-timeout/edit-timeout.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopNavComponent,
    HomeComponent,
    AccountComponent,
    FollowedUserComponent,
    FollowerUserComponent,
    ProfileComponent,
    RegisterComponent,
    ArticleRelatedComponent,
    ArticleEditComponent,
    ArticleSearchResultsComponent,
    ArticlePreviewCardComponent,
    ArticlePreviewListComponent,
    UploadFormComponent,
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
    EditTimeoutComponent
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
    AngularFireDatabaseModule
  ],
  entryComponents: [
    EditTimeoutComponent
  ],
  providers: [
    AuthService,
    DataCleanupService,
    UploadService,
    NotificationService,
    ArticleService,
    UserService,
    CommentService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {



  constructor() {
    fb.initializeApp(environment.fbConfig);
    const fs = fb.firestore();
    const settings = { timestampsInSnapshots: true };
    fs.settings(settings);
  }
}
