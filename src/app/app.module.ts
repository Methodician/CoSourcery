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
  MatDialogModule
} from '@angular/material';

// Services
import { ArticleService } from './services/article.service';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { UploadService } from './services/upload.service';
import { UserService } from './services/user.service';
import { CommentService } from './services/comment.service';
import { DataCleanupService } from './admin/services/data-cleanup.service';

// Directives
import { ClickOutDirective } from './directives/click-out.directive';

// Pipes
import { RelatedArticlePipe } from './shared/pipes/related-article.pipe';
import { ArticleSearchPipe } from './shared/pipes/article-search.pipe';
import { ReverseArrayPipe } from './shared/pipes/reverse-array.pipe';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { SafeUrlPipe } from './shared/pipes/safe-url.pipe';
import { TimeElapsedPipe } from './shared/pipes/time-elapsed.pipe';
import { TruncateTagsPipe } from './shared/pipes/truncate-tags.pipe';
import { TruncateStringPipe } from './shared/pipes/truncate-string.pipe';

// Components
import { AppComponent } from 'app/app.component';
import { ArticleEditComponent } from 'app/components/articles/article-edit/article-edit.component';
import { ArticlePreviewCardComponent } from 'app/components/articles/article-preview-card/article-preview-card.component';
import { ArticlePreviewListComponent } from 'app/components/articles/article-preview-list/article-preview-list.component';
import { ArticleRelatedComponent } from 'app/components/articles/article-related/article-related.component';
import { CommentComponent } from './components/comments/comment/comment.component';
import { CommentListComponent } from './components/comments/comment-list/comment-list.component';
import { DataCleanupComponent } from './admin/components/data-cleanup/data-cleanup.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { ProfileComponent } from 'app/components/account/profile/profile.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { TopNavComponent } from 'app/components/general/top-nav/top-nav.component';
import { UnauthorizedComponent } from './components/general/unauthorized/unauthorized.component';
import { EditTimeoutComponent } from './components/shared/dialogs/edit-timeout/edit-timeout.component';
import { LoginDialogComponent } from './components/modals/login-dialog/login-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    HomeComponent,
    ProfileComponent,
    RegisterComponent,
    ArticleRelatedComponent,
    ArticleEditComponent,
    ArticlePreviewCardComponent,
    ArticlePreviewListComponent,
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
    EditTimeoutComponent,
    LoginDialogComponent
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
    EditTimeoutComponent,
    LoginDialogComponent
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
