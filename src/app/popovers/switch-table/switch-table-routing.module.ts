import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwitchTablePage } from './switch-table.page';

const routes: Routes = [
  {
    path: '',
    component: SwitchTablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwitchTablePageRoutingModule {}
