import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UploadService } from './services/upload.service';
import { ArticleService } from './services/article.service';
import { NotificationService } from './services/notification.service';

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
import { TopNavComponent } from 'app/components/shared/top-nav/top-nav.component';
import * as fb from 'firebase';
import { LoginComponent } from 'app/components/account/login/login.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { AccountComponent } from 'app/components/account/account/account.component';
import { FollowedUserComponent } from 'app/components/account/followed-user/followed-user.component';
import { FollowerUserComponent } from 'app/components/account/follower-user/follower-user.component';
import { ProfileComponent } from 'app/components/account/profile/profile.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleCoverImageComponent } from 'app/components/articles/article-cover-image/article-cover-image.component';
import { ArticleDetailComponent } from 'app/components/articles/article-detail/article-detail.component';
import { ArticleFormComponent } from 'app/components/articles/article-form/article-form.component';
import { ArticleHistoryComponent } from 'app/components/articles/article-history/article-history.component';
import { ArticleHistoryDetailComponent } from 'app/components/articles/article-history-detail/article-history-detail.component';
import { ArticleRelatedComponent } from 'app/components/articles/article-related/article-related.component';
import { ArticleEditComponent } from 'app/components/articles/article-edit/article-edit.component';
import { ArticlePostComponent } from 'app/components/articles/article-post/article-post.component';
import { CommentComponent } from 'app/components/comments/comment/comment.component';
import { CommentFormComponent } from 'app/components/comments/comment-form/comment-form.component';
import { CommentListComponent } from 'app/components/comments/comment-list/comment-list.component';
import { CommentEditComponent } from 'app/components/comments/comment-edit/comment-edit.component';
import { CommentAddComponent } from 'app/components/comments/comment-add/comment-add.component';
import { CommentAddReplyComponent } from 'app/components/comments/comment-add-reply/comment-add-reply.component';
import { AboutUsComponent } from 'app/components/general/about-us/about-us.component';
import { ArticleSearchResultsComponent } from 'app/components/articles/article-search-results/article-search-results.component';
import { PageNotFoundComponent } from 'app/components/general/page-not-found/page-not-found.component';
import { NotificationsComponent } from 'app/components/general/notifications/notifications.component';
import { ArticlePreviewCardComponent } from 'app/components/articles/article-preview-card/article-preview-card.component';
import { ArticlePreviewListComponent } from 'app/components/articles/article-preview-list/article-preview-list.component';
import { CharacterCounterComponent } from 'app/components/shared/character-counter/character-counter.component';
import { FollowBtnComponent } from 'app/components/shared/follow-btn/follow-btn.component';
import { FooterComponent } from 'app/components/shared/footer/footer.component';
import { ProfileImageComponent } from 'app/components/shared/profile-image/profile-image.component';
import { UploadFormComponent } from 'app/components/shared/upload-form/upload-form.component';
import { SuggestionAddComponent } from 'app/components/suggestions/suggestion-add/suggestion-add.component';
import { SuggestionEditComponent } from 'app/components/suggestions/suggestion-edit/suggestion-edit.component';
import { SuggestionDetailComponent } from 'app/components/suggestions/suggestion-detail/suggestion-detail.component';
import { SuggestionFormComponent } from 'app/components/suggestions/suggestion-form/suggestion-form.component';
import { SuggestionPreviewComponent } from 'app/components/suggestions/suggestion-preview/suggestion-preview.component';
import { SuggestionVoteComponent } from 'app/components/suggestions/suggestion-vote/suggestion-vote.component';
import { SuggestionsComponent } from 'app/components/suggestions/suggestions/suggestions.component';
import { ChatComponent } from 'app/components/chat/chat/chat.component';
import { ChatFormComponent } from 'app/components/chat/chat-form/chat-form.component';
import { ChatListComponent } from 'app/components/chat/chat-list/chat-list.component';
import { UserInteractionComponent } from 'app/components/chat/user-interaction/user-interaction.component';
import { UserListComponent } from 'app/components/chat/user-list/user-list.component';
import { UserPresenceComponent } from 'app/components/chat/user-presence/user-presence.component';
import { RelatedArticlePipe } from './shared/pipes/related-article.pipe';
import { ArticleSearchPipe } from './shared/pipes/article-search.pipe';
import { ReverseArrayPipe } from './shared/pipes/reverse-array.pipe';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { SafeUrlPipe } from './shared/pipes/safe-url.pipe';
import { SuggestionSortPipe } from './shared/pipes/suggestion-sort.pipe';
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
    ArticleCoverImageComponent,
    ArticleDetailComponent,
    ArticleFormComponent,
    ArticleHistoryComponent,
    ArticleHistoryDetailComponent,
    ArticleRelatedComponent,
    ArticleEditComponent,
    ArticlePostComponent,
    CommentComponent,
    CommentFormComponent,
    CommentListComponent,
    CommentEditComponent,
    CommentAddComponent,
    CommentAddReplyComponent,
    AboutUsComponent,
    ArticleSearchResultsComponent,
    PageNotFoundComponent,
    NotificationsComponent,
    ArticlePreviewCardComponent,
    ArticlePreviewListComponent,
    CharacterCounterComponent,
    FollowBtnComponent,
    FooterComponent,
    ProfileImageComponent,
    UploadFormComponent,
    SuggestionAddComponent,
    SuggestionEditComponent,
    SuggestionDetailComponent,
    SuggestionFormComponent,
    SuggestionPreviewComponent,
    SuggestionVoteComponent,
    SuggestionsComponent,
    ChatComponent,
    ChatFormComponent,
    ChatListComponent,
    UserInteractionComponent,
    UserListComponent,
    UserPresenceComponent,
    RelatedArticlePipe,
    ArticleSearchPipe,
    ReverseArrayPipe,
    SafeHtmlPipe,
    SafeUrlPipe,
    SuggestionSortPipe,
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
  providers: [AuthService, UploadService, NotificationService, ArticleService],
  bootstrap: [AppComponent]
})
export class AppModule {
  fbConfig = {
    apiKey: 'AIzaSyBn8hJ2vDLN21aUl9cP-RgeOWZHZOlbtdY',
    authDomain: 'scatterschool-dev.firebaseapp.com',
    databaseURL: 'https://scatterschool-dev.firebaseio.com',
    projectId: 'scatterschool-dev',
    storageBucket: 'scatterschool-dev.appspot.com',
    messagingSenderId: '945815872407'
  };

  constructor() {
    fb.initializeApp(this.fbConfig);
    const fs = fb.firestore();
    const settings = { timestampsInSnapshots: true };
    fs.settings(settings);
  }
}
