import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TableRecordPageRoutingModule } from './table-record-routing.module';

import { TableRecordPage } from './table-record.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TableRecordPageRoutingModule
  ],
  declarations: [TableRecordPage]
})
export class TableRecordPageModule {}
