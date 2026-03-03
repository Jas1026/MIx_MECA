import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PedidosUnitariosPage } from './pedidos-unitarios.page';

const routes: Routes = [
  {
    path: '',
    component: PedidosUnitariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidosUnitariosPageRoutingModule {}
