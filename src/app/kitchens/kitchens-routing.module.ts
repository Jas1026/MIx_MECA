import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KitchensPage } from './kitchens.page';

const routes: Routes = [
  {
    path: '',
    component: KitchensPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KitchensPageRoutingModule {}
