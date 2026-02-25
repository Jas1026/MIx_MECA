import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateProductComponent } from './create-product.component';

@NgModule({
  declarations: [CreateProductComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateProductComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateProductModule {}