import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginMixturaPage } from './login-mixtura.page';

const routes: Routes = [
  {
    path: '',
    component: LoginMixturaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginMixturaPageRoutingModule {}
