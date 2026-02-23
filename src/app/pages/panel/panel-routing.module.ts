import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelPage } from './panel.page';

const routes: Routes = [
  {
    path: '',
    component: PanelPage,
    children: [
      {
        path: 'mesas/:id',
        loadChildren: () =>
          import('../../pages/mesas/mesas.module').then(m => m.MesasPageModule)
      },
      {
        path: 'cocina/:id',
        loadChildren: () =>
          import('../../pages/cocina/cocina.module').then(m => m.CocinaPageModule)
      },
      {
        path: 'pedidos',
        loadChildren: () => import('../pedidos/pedidos.module')
          .then(m => m.PedidosPageModule)
      },
      {
        path: 'inventario',
        loadChildren: () => import('../inventario/inventario.module')
          .then(m => m.InventarioPageModule)
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelPageRoutingModule { }