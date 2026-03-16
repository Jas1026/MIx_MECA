import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IngredientAdjustModalComponent } from './ingredient-adjust-modal.component';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE para el ngModel
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';

@NgModule({
  declarations: [IngredientAdjustModalComponent],
imports: [IonicModule, CommonModule, FormsModule],
  exports: [IngredientAdjustModalComponent]
})
export class IngredientAdjustModalModule {
  
}