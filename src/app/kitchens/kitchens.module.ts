import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KitchensPageRoutingModule } from './kitchens-routing.module';

import { KitchensPage } from './kitchens.page';
import { CreateKitchenModule } from 'src/app/modals/create-kitchen/create-kitchen.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KitchensPageRoutingModule,
    CreateKitchenModule
  ],
  declarations: [KitchensPage]
})
export class KitchensPageModule {}
