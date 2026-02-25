import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlatsPageRoutingModule } from './flats-routing.module';

import { FlatsPage } from './flats.page';


import { FlatFormComponent } from '../../modals/flats-form/flats-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlatsPageRoutingModule,
    FlatFormComponent
  ],
  declarations: [FlatsPage]
})
export class FlatsPageModule {}
