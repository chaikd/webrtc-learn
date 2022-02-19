import { RecordComponent } from './record/record.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveComponent } from './live/live.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'meeting/:id/:username',
    component: LiveComponent
  },
  {
    path: 'record',
    component: RecordComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
