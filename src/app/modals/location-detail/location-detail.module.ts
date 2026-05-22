import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LocationDetailComponent } from './location-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [LocationDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragDropModule
  ],
  exports: [LocationDetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LocationDetailModule {}