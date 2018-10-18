import { environment } from 'environments/environment';

// Firebase and AngularFire imports
import * as fb from 'firebase/app';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

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
  MatTabsModule
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
    ClickOutDirective
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
    MatSidenavModule,
    MatTooltipModule,
    MatTabsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    AngularFireModule.initializeApp(environment.fbConfig),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  providers: [AuthService, UploadService, NotificationService, ArticleService, UserService],
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
