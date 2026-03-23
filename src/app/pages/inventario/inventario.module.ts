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
import { BottleManagerModule } from 'src/app/modals/bottle-manager/bottle-manager.module';
import { LoanManagerModule } from 'src/app/modals/loan-manager/loan-manager.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventarioPageRoutingModule,
    CreateIngredientModule,
    CreateProductModule,
    ViewProductDetailModule,     
    BottleManagerModule,
    LoanManagerModule,
  ],
  declarations: [InventarioPage]
})
export class InventarioPageModule {}
