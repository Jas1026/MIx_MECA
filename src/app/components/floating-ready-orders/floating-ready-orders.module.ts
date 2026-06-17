import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { FloatingReadyOrdersComponent } from './floating-ready-orders.component';

@NgModule({
  declarations: [FloatingReadyOrdersComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [FloatingReadyOrdersComponent]
})
export class FloatingReadyOrdersModule {}