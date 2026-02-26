import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'tables',
    loadChildren: () => import('./pages/tables/tables.module').then( m => m.TablesPageModule)
  },
  {
    path: 'table',
    loadChildren: () => import('./pages/table/table.module').then( m => m.TablePageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./pages/categories/categories.module').then( m => m.CategoriesPageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./pages/products/products.module').then( m => m.ProductsPageModule)
  },
  {
    path: 'product-detail',
    loadChildren: () => import('./popovers/product-detail/product-detail.module').then( m => m.ProductDetailPageModule)
  },
  {
    path: 'ticket-detail',
    loadChildren: () => import('./popovers/ticket-detail/ticket-detail.module').then( m => m.TicketDetailPageModule)
  },
  {
    path: 'devolution',
    loadChildren: () => import('./popovers/devolution/devolution.module').then( m => m.DevolutionPageModule)
  },
  {
    path: 'invoice-detail',
    loadChildren: () => import('./popovers/invoice-detail/invoice-detail.module').then( m => m.InvoiceDetailPageModule)
  },
  {
    path: 'product',
    loadChildren: () => import('./pages/product/product.module').then( m => m.ProductPageModule)
  },
  {
    path: 'kitchen',
    loadChildren: () => import('./pages/kitchen/kitchen.module').then( m => m.KitchenPageModule)
  },
  {
    path: 'switch-table',
    loadChildren: () => import('./popovers/switch-table/switch-table.module').then( m => m.SwitchTablePageModule)
  },
  {
    path: 'close-cash',
    loadChildren: () => import('./popovers/close-cash/close-cash.module').then( m => m.CloseCashPageModule)
  },
  {
    path: 'brief',
    loadChildren: () => import('./pages/brief/brief.module').then( m => m.BriefPageModule)
  },
  {
    path: 'add-brief-note',
    loadChildren: () => import('./popover/add-brief-note/add-brief-note.module').then( m => m.AddBriefNotePageModule)
  },
  {
    path: 'add-brief-product',
    loadChildren: () => import('./popover/add-brief-product/add-brief-product.module').then( m => m.AddBriefProductPageModule)
  },
  {
    path: 'table-record',
    loadChildren: () => import('./pages/table-record/table-record.module').then( m => m.TableRecordPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
    {
    path: 'panel',
    loadChildren: () => import('./pages/panel/panel.module').then( m => m.PanelPageModule)
  },
{
  path: 'panel/cocina/:id',
  loadChildren: () => import('./pages/cocina/cocina.module').then(m => m.CocinaPageModule)
},

{
  path: 'facturacion/:id',
  loadChildren: () => import('./pages/facturacion/facturacion.module')
    .then(m => m.FacturacionPageModule)
},
  {
    path: 'extra-cost',
    loadChildren: () => import('./popovers/extra-cost/extra-cost.module').then( m => m.ExtraCostPageModule)
  },
  {
    path: 'selector-login',
    loadChildren: () => import('./pages/selector-login/selector-login.module').then( m => m.SelectorLoginPageModule)
  },
  {
  path: 'login-mixtura',
  loadChildren: () => import('./pages/login-mixtura/login-mixtura.module')
    .then(m => m.LoginMixturaPageModule)
},
{
  path: 'login-meca',
  loadChildren: () => import('./pages/login-meca/login-meca.module')
    .then(m => m.LoginMecaPageModule)
},
  {
    path: 'login-mixtura',
    loadChildren: () => import('./pages/login-mixtura/login-mixtura.module').then( m => m.LoginMixturaPageModule)
  },
  {
    path: 'login-meca',
    loadChildren: () => import('./pages/login-meca/login-meca.module').then( m => m.LoginMecaPageModule)
  },
  {
    path: 'mesas',
    loadChildren: () => import('./pages/mesas/mesas.module').then( m => m.MesasPageModule)
  },
  {
    path: 'cocina',
    loadChildren: () => import('./pages/cocina/cocina.module').then( m => m.CocinaPageModule)
  },
{
  path: 'facturacion/:id',
  loadChildren: () => import('./pages/facturacion/facturacion.module')
    .then(m => m.FacturacionPageModule)
},
  {
    path: 'pedidos',
    loadChildren: () => import('./pages/pedidos/pedidos.module').then( m => m.PedidosPageModule)
  },
  {
    path: 'inventario',
    loadChildren: () => import('./pages/inventario/inventario.module').then( m => m.InventarioPageModule)
  },
  {
    path: 'informes',
    loadChildren: () => import('./pages/informes/informes.module').then( m => m.InformesPageModule)
  },
  {
    path: 'flats',
    loadChildren: () => import('./pages/flats/flats.module').then( m => m.FlatsPageModule)
  },
  {
    path: 'cafe-tables',
    loadChildren: () => import('./pages/cafe-tables/cafe-tables.module').then( m => m.CafeTablesPageModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.module').then( m => m.UserPageModule)
  }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
