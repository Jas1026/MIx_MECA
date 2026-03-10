import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { KitchenReadyToastComponent } from './kitchen-ready-toast.component';

@NgModule({
  declarations: [KitchenReadyToastComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [KitchenReadyToastComponent]
})
export class KitchenReadyToastModule {}