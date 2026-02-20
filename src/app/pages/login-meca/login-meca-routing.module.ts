import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginMecaPage } from './login-meca.page';

const routes: Routes = [
  {
    path: '',
    component: LoginMecaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginMecaPageRoutingModule {}
