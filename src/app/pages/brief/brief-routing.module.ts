import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BriefPage } from './brief.page';

const routes: Routes = [
  {
    path: '',
    component: BriefPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BriefPageRoutingModule {}
