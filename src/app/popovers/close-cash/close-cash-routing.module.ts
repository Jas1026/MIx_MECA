import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CloseCashPage } from './close-cash.page';

const routes: Routes = [
  {
    path: '',
    component: CloseCashPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloseCashPageRoutingModule {}
