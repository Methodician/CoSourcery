import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TopNavComponent } from './components/shared/top-nav/top-nav.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: '', component: AppComponent, children: [
    {path: 'topnav', component: TopNavComponent},
  ]
},
  {path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
