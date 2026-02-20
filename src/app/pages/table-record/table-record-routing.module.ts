import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TableRecordPage } from './table-record.page';

const routes: Routes = [
  {
    path: '',
    component: TableRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRecordPageRoutingModule {}
