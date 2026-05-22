import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FractionManagerComponent } from './fraction-manager.component';

@NgModule({
  declarations: [FractionManagerComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [FractionManagerComponent]  
})
export class FractionManagerModule {}