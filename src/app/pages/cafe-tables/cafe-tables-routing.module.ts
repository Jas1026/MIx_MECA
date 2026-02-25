import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CafeTablesPage } from './cafe-tables.page';

const routes: Routes = [
  {
    path: '',
    component: CafeTablesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CafeTablesPageRoutingModule {}
