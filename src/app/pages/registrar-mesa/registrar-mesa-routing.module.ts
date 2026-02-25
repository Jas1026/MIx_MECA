import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarMesaPage } from './registrar-mesa.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarMesaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarMesaPageRoutingModule {}
