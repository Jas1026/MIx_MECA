import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwitchTablePageRoutingModule } from './switch-table-routing.module';

import { SwitchTablePage } from './switch-table.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchTablePageRoutingModule
  ],
  declarations: [SwitchTablePage]
})
export class SwitchTablePageModule {}
