import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CafeTablesPageRoutingModule } from './cafe-tables-routing.module';

import { CafeTablesPage } from './cafe-tables.page';
import { CreateCafeTablesModule } from '../../modals/create-cafe-tables/create-cafe-tables.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CafeTablesPageRoutingModule,
    CreateCafeTablesModule
  ],
  declarations: [CafeTablesPage]
})
export class CafeTablesPageModule {}
