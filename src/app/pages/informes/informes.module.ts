import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InformesPageRoutingModule } from '../../pages/informes/informes-routing.module';

import { InformesPage } from './informes.page';
import { AreaDetalleModalPageModule } from '../../modals/area-detalle-modal/area-detalle-modal.module';

 @NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformesPageRoutingModule,AreaDetalleModalPageModule
    
  ],
  declarations: [InformesPage]
})
export class InformesPageModule {}
