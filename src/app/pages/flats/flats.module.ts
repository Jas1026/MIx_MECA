import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlatsPageRoutingModule } from './flats-routing.module';

import { FlatsPage } from './flats.page';
import { CreateFlatComponent } from '../../modals/create-flat/create-flat.component';
import { CreateFlatModule } from 'src/app/modals/create-flat/create-flat.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlatsPageRoutingModule,
    CreateFlatModule
    
  ],
  declarations: [FlatsPage]
})
export class FlatsPageModule {}
