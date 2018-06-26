import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TopNavComponent } from './components/shared/top-nav/top-nav.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'topnav', component: TopNavComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
