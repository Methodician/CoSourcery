import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

import { HomeComponent } from 'app/components/general/home/home.component';
import { RegisterComponent } from 'app/components/account/register/register.component';
import { ArticleEditComponent } from './components/articles/article-edit/article-edit.component';
import { DataCleanupComponent } from './admin/components/data-cleanup/data-cleanup.component';
import { ProfileComponent } from './components/account/profile/profile.component';
import { UnsavedChangesGuard } from './shared/guards/unsaved-changes.guard';
import { UnauthorizedComponent } from './components/general/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search/:query', component: HomeComponent },
  { path: 'search', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'createarticle',
    canActivate: [AuthGuard],
    canDeactivate: [UnsavedChangesGuard],
    component: ArticleEditComponent,
  },
  {
    path: 'article/:key',
    canDeactivate: [UnsavedChangesGuard],
    component: ArticleEditComponent,
  },
  {
    path: 'profile',
    children: [
      {
        path: ':key',
        component: ProfileComponent,
      },
      {
        path: '',
        component: ProfileComponent,
        canActivate: [AuthGuard],
      }
    ]
  },
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
  { path: 'admin/data-cleanup', component: DataCleanupComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
