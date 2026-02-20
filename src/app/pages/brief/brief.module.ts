import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BriefPageRoutingModule } from './brief-routing.module';

import { BriefPage } from './brief.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BriefPageRoutingModule
  ],
  declarations: [BriefPage]
})
export class BriefPageModule {}
