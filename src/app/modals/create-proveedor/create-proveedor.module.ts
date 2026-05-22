import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateProveedorComponent } from './create-proveedor.component';

@NgModule({
  declarations: [CreateProveedorComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateProveedorComponent] 
})
export class CreateProveedorModule {}