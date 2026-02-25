import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FlatsPage } from './flats.page';

const routes: Routes = [
  {
    path: '',
    component: FlatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlatsPageRoutingModule {}
