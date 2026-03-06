import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AreaDetalleModalPage } from './area-detalle-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AreaDetalleModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AreaDetalleModalPageRoutingModule {}
