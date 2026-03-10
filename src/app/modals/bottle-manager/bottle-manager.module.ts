import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BottleManagerComponent } from './bottle-manager.component';

@NgModule({
  declarations: [BottleManagerComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [BottleManagerComponent] 
})
export class BottleManagerModule {}