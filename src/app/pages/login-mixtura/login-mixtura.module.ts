import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginMixturaPageRoutingModule } from './login-mixtura-routing.module';

import { LoginMixturaPage } from './login-mixtura.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginMixturaPageRoutingModule
  ],
  declarations: [LoginMixturaPage]
})
export class LoginMixturaPageModule {}
