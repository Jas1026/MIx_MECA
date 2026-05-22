import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewProveedorComponent } from './view-proveedor.component';

@NgModule({
  declarations: [ViewProveedorComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ViewProveedorComponent] 
})
export class ViewProveedorModule {}