import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RegistrarMesaPageRoutingModule } from './registrar-mesa-routing.module';
import { RegistrarMesaPage } from './registrar-mesa.page';
import { MesaFormComponent } from 'src/app/modals/mesa-form/mesa-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarMesaPageRoutingModule
  ],
  declarations: [
    RegistrarMesaPage,
    MesaFormComponent   // ✅ VA AQUÍ
  ]
})
export class RegistrarMesaPageModule {}