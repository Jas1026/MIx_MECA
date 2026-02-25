import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateFlatComponent } from './create-flat.component';

@NgModule({
  declarations: [CreateFlatComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateFlatComponent] 
})
export class CreateFlatModule {}