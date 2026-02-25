import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewProductDetailComponent } from './view-product-detail.component';

@NgModule({
  declarations: [ViewProductDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ViewProductDetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewProductDetailModule {}