import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UsersPageRoutingModule } from './users-routing.module';
import { UsersPage } from './users.page';
import { UserFormComponent } from '../../modals/user-form/user-form.component';
import { ConfirmModalComponent } from 'src/app/shared/confirm-modal/confirm-modal.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    UsersPageRoutingModule
  ],
  declarations: [
    UsersPage,
    UserFormComponent,  // 🔥 AQUÍ SE DECLARA
    ConfirmModalComponent
  ]
})
export class UsersPageModule {}