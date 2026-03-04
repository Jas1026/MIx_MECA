import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosUnitariosPageRoutingModule } from './pedidos-unitarios-routing.module';

import { PedidosUnitariosPage } from './pedidos-unitarios.page';
import { ViewOrderProductsModule } from '../../modals/view-order-products/view-order-products.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidosUnitariosPageRoutingModule,
    ViewOrderProductsModule
  ],
  declarations: [PedidosUnitariosPage]
})
export class PedidosUnitariosPageModule {}
