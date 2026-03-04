import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewOrderProductsComponent } from './view-order-products.component';

@NgModule({
  declarations: [ViewOrderProductsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ViewOrderProductsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewOrderProductsModule {}