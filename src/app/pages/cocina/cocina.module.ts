import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CocinaPageRoutingModule } from './cocina-routing.module';

import { CocinaPage } from './cocina.page';
import { IngredientAdjustModalModule } from '../../ingredient-adjust-modal/ingredient-adjust-modal.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CocinaPageRoutingModule,
    IngredientAdjustModalModule,
  ],
  declarations: [CocinaPage]
})
export class CocinaPageModule {}
