import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CloseCashPageRoutingModule } from './close-cash-routing.module';

import { CloseCashPage } from './close-cash.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CloseCashPageRoutingModule
  ],
  declarations: [CloseCashPage]
})
export class CloseCashPageModule {}
