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
import * as fb from 'firebase';
import { LoginComponent } from 'app/components/account/login/login.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { AccountComponent } from 'app/components/account/account/account.component';
import { FollowedUserComponent } from 'app/components/account/followed-user/followed-user.component';
import { FollowerUserComponent } from 'app/components/account/follower-user/follower-user.component';
import { ProfileComponent } from 'app/components/account/profile/profile.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleDetailComponent } from 'app/components/articles/article-detail/article-detail.component';
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
    ArticleDetailComponent,
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
    TruncateStringPipe
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
    ReactiveFormsModule
  ],
  providers: [AuthService, UploadService, NotificationService, ArticleService, UserService],
  bootstrap: [AppComponent]
})

export class AppModule {

  // Test Firestore db
  fbConfig = {
    apiKey: 'AIzaSyAb3L-t-WB0rf6A9j8gVSRB9STJJvLUEfw',
    authDomain: 'cosourcerytest.firebaseapp.com',
    databaseURL: 'https://cosourcerytest.firebaseio.com',
    projectId: 'cosourcerytest',
    storageBucket: 'cosourcerytest.appspot.com',
    messagingSenderId: '146479623747'
  };

  constructor() {
    fb.initializeApp(this.fbConfig);
    const fs = fb.firestore();
    const settings = { timestampsInSnapshots: true };
    fs.settings(settings);
  }
}
