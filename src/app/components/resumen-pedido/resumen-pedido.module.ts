import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ResumenPedidoComponent } from './resumen-pedido.component';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE para el ngModel
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';

@NgModule({
  declarations: [ResumenPedidoComponent],
imports: [IonicModule, CommonModule, FormsModule],
  exports: [ResumenPedidoComponent]
})
export class ResumenPedidoModule {
  
}