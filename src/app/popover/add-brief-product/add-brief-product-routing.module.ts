import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBriefProductPage } from './add-brief-product.page';

const routes: Routes = [
  {
    path: '',
    component: AddBriefProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddBriefProductPageRoutingModule {}
