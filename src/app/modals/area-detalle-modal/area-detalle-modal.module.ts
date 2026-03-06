import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AreaDetalleModalPageRoutingModule } from './area-detalle-modal-routing.module';

import { AreaDetalleModalPage } from './area-detalle-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AreaDetalleModalPageRoutingModule
  ],
  declarations: [AreaDetalleModalPage]
})
export class AreaDetalleModalPageModule {}
