import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateKitchenComponent } from './create-kitchen.component';

@NgModule({
  declarations: [CreateKitchenComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateKitchenComponent] 
})
export class CreateKitchenModule {}