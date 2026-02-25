import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventarioPageRoutingModule } from './inventario-routing.module';
import { CreateProductComponent } from '../../modals/create-product/create-product.component';
import { InventarioPage } from './inventario.page';
import { CreateIngredientModule } from '../../modals/create-ingredient/create-ingredient.module';
import { CreateProductModule } from 'src/app/modals/create-product/create-product.module';
import { ViewProductDetailModule } from 'src/app/modals/view-product-detail/view-product-detail.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventarioPageRoutingModule,
    CreateIngredientModule,
    CreateProductModule,
    ViewProductDetailModule,     
  ],
  declarations: [InventarioPage]
})
export class InventarioPageModule {}
