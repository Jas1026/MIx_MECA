import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LocationDetailModule } from '../modals/location-detail/location-detail.module';
import { LocationsPage } from './locations.page';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,     // 🔥 IMPORTANTE para ngModel
    IonicModule,      // 🔥 IMPORTANTE para ion-*
    DragDropModule,
    LocationDetailModule
    
  ],
  declarations: [LocationsPage]
})
export class LocationsPageModule {}