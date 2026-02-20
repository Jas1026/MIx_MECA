import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExtraCostPage } from './extra-cost.page';

const routes: Routes = [
  {
    path: '',
    component: ExtraCostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtraCostPageRoutingModule {}
