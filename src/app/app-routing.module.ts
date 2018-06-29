import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from 'app/components/account/login/login.component';
import { TopNavComponent } from 'app/components/shared/top-nav/top-nav.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleDetailComponent } from './components/articles/article-detail/article-detail.component';
import { ArticleHistoryComponent } from './components/articles/article-history/article-history.component';
import { SuggestionsComponent } from './components/suggestions/suggestions/suggestions.component';
import { SuggestionDetailComponent } from './components/suggestions/suggestion-detail/suggestion-detail.component';
import { AboutUsComponent } from './components/general/about-us/about-us.component';
import { PageNotFoundComponent } from './components/general/page-not-found/page-not-found.component';
import { SuggestionAddComponent } from './components/suggestions/suggestion-add/suggestion-add.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent, children: [
    {path: 'nav', component: TopNavComponent}
  ] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  // {
  //   path: 'account',
  //   canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: ':key',
  //       component: AccountComponent
  //     },
  //     {
  //       path: '',
  //       component: AccountComponent
  //     }
  //   ]
  // },
  // {
  //   path: 'profile',
  //   canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: ':key',
  //       component: ProfileComponent
  //     },
  //     {
  //       path: '',
  //       component: ProfileComponent
  //     }
  //   ]
  // },
  // {
  //   path: 'postarticle',
  //   canActivate: [AuthGuard],
  //   component: PostArticleComponent
  // },
  // {
  //   path: 'editarticle/:key',
  //   canActivate: [AuthGuard],
  //   component: EditArticleComponent
  // },
  { path: 'articledetail/:key', component: ArticleDetailComponent },
  { path: 'articlehistory/:key', component: ArticleHistoryComponent },
  // {
  //   path: 'articlesearch',
  //   children: [
  //     {
  //       path: ':query',
  //       component: ArticleSearchResultsComponent
  //     },
  //     {
  //       path: '',
  //       component: ArticleSearchResultsComponent
  //     }
  //   ]
  // },
  { path: 'suggestions', component: SuggestionsComponent },
  { path: 'postsuggestion',  component: SuggestionAddComponent }, // ADD  canActivate: [AuthGuard],
  { path: 'suggestion/:key', component: SuggestionDetailComponent },
  // {
  //   path: 'editsuggestion/:key',
  //   canActivate: [AuthGuard],
  //   component: EditSuggestionComponent
  // },
  { path: 'aboutus', component: AboutUsComponent },
  { path: '', component: HomeComponent },
  // ATTN: this route MUST live at the end of all the routes in this array.
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
