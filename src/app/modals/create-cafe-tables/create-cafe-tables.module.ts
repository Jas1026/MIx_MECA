import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateCafeTablesComponent } from './create-cafe-tables.component';

@NgModule({
  declarations: [CreateCafeTablesComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateCafeTablesComponent] 
})
export class CreateCafeTablesModule {}