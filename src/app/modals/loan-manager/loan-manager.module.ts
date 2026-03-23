import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoanManagerComponent } from './loan-manager.component';

@NgModule({
  declarations: [LoanManagerComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [LoanManagerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoanManagerModule {}