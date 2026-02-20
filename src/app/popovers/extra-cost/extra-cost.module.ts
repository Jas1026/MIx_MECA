import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExtraCostPageRoutingModule } from './extra-cost-routing.module';

import { ExtraCostPage } from './extra-cost.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExtraCostPageRoutingModule
  ],
  declarations: [ExtraCostPage]
})
export class ExtraCostPageModule {}
