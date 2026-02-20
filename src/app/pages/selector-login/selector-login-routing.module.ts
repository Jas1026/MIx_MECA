import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectorLoginPage } from './selector-login.page';

const routes: Routes = [
  {
    path: '',
    component: SelectorLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectorLoginPageRoutingModule {}
