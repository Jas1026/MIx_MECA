import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DevolutionPageRoutingModule } from './devolution-routing.module';

import { DevolutionPage } from './devolution.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DevolutionPageRoutingModule
  ],
  declarations: [DevolutionPage]
})
export class DevolutionPageModule {}
