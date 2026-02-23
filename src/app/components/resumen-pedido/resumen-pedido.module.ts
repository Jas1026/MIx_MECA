import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ResumenPedidoComponent } from './resumen-pedido.component';

@NgModule({
  declarations: [ResumenPedidoComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ResumenPedidoComponent]
})
export class ResumenPedidoModule {}