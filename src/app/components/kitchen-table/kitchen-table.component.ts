import { Component, Input, OnInit, Output } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-kitchen-table',
  templateUrl: './kitchen-table.component.html',
  styleUrls: ['./kitchen-table.component.scss'],
})
export class KitchenTableComponent  implements OnInit {
  @Input() ticket:any;
  constructor(private serverContent: ServerContentService) { }
  viewed = true;
  ngOnInit() {
    this.ticket.products.forEach((product: { state: string; }) => {
      if (product.state == "espera") {
        this.viewed = false;
      }
    });
    console.log(this.ticket);
  }
  SeeProducts() {
    this.ticket.products.forEach((product: { state: string; id: string }) => {
      if (product.state == "espera") {
        this.serverContent.UpdateProductStatus(product.id, "preparando").subscribe(async data => {
          product.state = "preparando";
        });
      }
    });
  }
}
