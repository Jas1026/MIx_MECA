import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MesasPageRoutingModule } from './mesas-routing.module';

import { MesasPage } from './mesas.page';
import { ResumenPedidoModule } from 
'../../components/resumen-pedido/resumen-pedido.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MesasPageRoutingModule,
    ResumenPedidoModule   
  ],
  declarations: [MesasPage]
})
export class MesasPageModule {}
