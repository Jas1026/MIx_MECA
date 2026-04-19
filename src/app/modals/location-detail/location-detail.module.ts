import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LocationDetailComponent } from './location-detail.component';

@NgModule({
  declarations: [LocationDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [LocationDetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LocationDetailModule {}