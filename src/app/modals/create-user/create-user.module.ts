import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateUserComponent } from './create-user.component';

@NgModule({
  declarations: [CreateUserComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CreateUserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateUserModule {}