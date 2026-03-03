import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosUnitariosPageRoutingModule } from './pedidos-unitarios-routing.module';

import { PedidosUnitariosPage } from './pedidos-unitarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidosUnitariosPageRoutingModule
  ],
  declarations: [PedidosUnitariosPage]
})
export class PedidosUnitariosPageModule {}
