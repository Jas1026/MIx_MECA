import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddBriefProductPageRoutingModule } from './add-brief-product-routing.module';

import { AddBriefProductPage } from './add-brief-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddBriefProductPageRoutingModule
  ],
  declarations: [AddBriefProductPage]
})
export class AddBriefProductPageModule {}
