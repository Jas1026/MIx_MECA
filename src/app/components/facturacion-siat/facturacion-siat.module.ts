import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { FacturacionSiatComponent } from './facturacion-siat.component';

@NgModule({
  declarations: [FacturacionSiatComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [FacturacionSiatComponent]
})
export class FacturacionSiatModule {}