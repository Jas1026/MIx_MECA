import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserPageRoutingModule } from './user-routing.module';

import { UsersPage } from './user.page';
import { CreateUserModule } from '../../modals/create-user/create-user.module';
import { ComponentsModule } from 'src/app/components/components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserPageRoutingModule,
    ComponentsModule,
    CreateUserModule

  ],
  declarations: [UsersPage]
})
export class UserPageModule {}
