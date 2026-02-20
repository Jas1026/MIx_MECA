import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginMecaPageRoutingModule } from './login-meca-routing.module';

import { LoginMecaPage } from './login-meca.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginMecaPageRoutingModule
  ],
  declarations: [LoginMecaPage]
})
export class LoginMecaPageModule {}
