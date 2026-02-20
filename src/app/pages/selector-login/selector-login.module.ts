import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectorLoginPageRoutingModule } from './selector-login-routing.module';

import { SelectorLoginPage } from './selector-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectorLoginPageRoutingModule
  ],
  declarations: [SelectorLoginPage]
})
export class SelectorLoginPageModule {}
