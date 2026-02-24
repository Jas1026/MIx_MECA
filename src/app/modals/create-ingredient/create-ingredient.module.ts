import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateIngredientComponent } from './create-ingredient.component';

@NgModule({
  declarations: [CreateIngredientComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateIngredientComponent]  // 👈 IMPORTANTE
})
export class CreateIngredientModule {}