import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProveedorPageRoutingModule } from './proveedor-routing.module';

import { ProveedorPage } from './proveedor.page';
import { CreateProveedorModule } from 'src/app/modals/create-proveedor/create-proveedor.module';
import { ViewProveedorModule } from 'src/app/modals/view-proveedor/view-proveedor.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateProveedorModule,
    ViewProveedorModule,
    ProveedorPageRoutingModule
  ],
  declarations: [ProveedorPage]
})
export class ProveedorPageModule {}
