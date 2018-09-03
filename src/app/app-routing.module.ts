import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

import { LoginComponent } from '../app/components/account/login/login.component';
import { HomeComponent } from 'app/components/general/home/home.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleDetailComponent } from './components/articles/article-detail/article-detail.component';
import { ArticleHistoryComponent } from './components/articles/article-history/article-history.component';
import { ArticleEditComponent } from './components/articles/article-edit/article-edit.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'createarticle',
    canActivate: [AuthGuard],
    component: ArticleEditComponent},
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
  {
    path: 'editarticle/:key',
    canActivate: [AuthGuard],
    component: ArticleEditComponent
  },
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
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
