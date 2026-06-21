import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DateFilterModalComponent } from './date-filter-modal.component';

@NgModule({
  declarations: [DateFilterModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [DateFilterModalComponent] 
})
export class DateFilterModalModule {}