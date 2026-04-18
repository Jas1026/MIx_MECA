import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelPage } from './panel.page';
import { RoleGuard } from 'src/app/guards/role.guard';
const routes: Routes = [
  {
    path: '',
    component: PanelPage,
    children: [
      {
        path: 'mesas/:id',
        loadChildren: () => import('../../pages/mesas/mesas.module').then(m => m.MesasPageModule),
        canActivate: [RoleGuard],
        // Agregamos jefe_mesero que faltaba aquí
        data: { expectedRoles: ['admin', 'mesero', 'jefe_mesero'] }
      },
      {
        path: 'cocina/:id',
        loadChildren: () => import('../../pages/cocina/cocina.module').then(m => m.CocinaPageModule),
        canActivate: [RoleGuard],
        // Cambiado 'cocinero' por 'cocina' para que coincida con tu DB/HTML
        data: { expectedRoles: ['admin', 'cocina'] }
      },
      {
        path: 'pedidos',
        loadChildren: () => import('../pedidos/pedidos.module').then(m => m.PedidosPageModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin', 'mesero', 'jefe_mesero'] }
      },
      {
        path: 'inventario',
        loadChildren: () => import('../inventario/inventario.module').then(m => m.InventarioPageModule),
        canActivate: [RoleGuard],
        // Sincronizado con los roles de tu menú
        data: { expectedRoles: ['admin', 'mesero', 'jefe_mesero', 'cocina'] }
      },
      {
        path: 'informes',
        loadChildren: () => import('../informes/informes.module').then(m => m.InformesPageModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin'] }
      },
      {
        path: 'flats',
        loadChildren: () => import('../flats/flats.module').then(m => m.FlatsPageModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin'] }
      },
      {
        path: 'tables',
        loadChildren: () => import('../cafe-tables/cafe-tables-routing.module').then(m => m.CafeTablesPageRoutingModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin'] }
      },
      {
        path: 'user',
        loadChildren: () => import('../user/user-routing.module').then(m => m.UserPageRoutingModule),
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin'] }
      },
      {
        path: 'pedidos_unit',
        loadChildren: () => import('../pedidos-unitarios/pedidos-unitarios.module').then(m => m.PedidosUnitariosPageModule),
        canActivate: [RoleGuard],
        data: { expectedRoles:  ['admin', 'mesero', 'jefe_mesero']  }
      },
            {
        path: 'locations',
        loadChildren: () => import('../../locations/locations-routing.module').then(m => m.LocationsPageRoutingModule),
        canActivate: [RoleGuard],
        data: { expectedRoles:  ['admin', 'mesero', 'jefe_mesero']  }
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