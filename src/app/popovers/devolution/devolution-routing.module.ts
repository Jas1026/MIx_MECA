import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DevolutionPage } from './devolution.page';

const routes: Routes = [
  {
    path: '',
    component: DevolutionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevolutionPageRoutingModule {}
