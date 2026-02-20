/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { KitchenTableComponent } from './kitchen-table/kitchen-table.component';
import { KitchenTableItemComponent } from './kitchen-table-item/kitchen-table-item.component';
import { ProductItemComponent } from './product-item/product-item.component';
import { TicketComponent } from './ticket/ticket.component';
import { DashboardTicketComponent } from './dashboard-ticket/dashboard-ticket.component';


@NgModule({
  declarations: [
    KitchenTableComponent,
    KitchenTableItemComponent,
    ProductItemComponent,
    TicketComponent,
    DashboardTicketComponent

  ],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [
    KitchenTableComponent,
    KitchenTableItemComponent,
    ProductItemComponent,
    TicketComponent,
    DashboardTicketComponent
  ],
})
export class ComponentsModule { }