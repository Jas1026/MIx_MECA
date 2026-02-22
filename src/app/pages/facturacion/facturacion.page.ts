import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.page.html',
  styleUrls: ['./facturacion.page.scss'],
})
export class FacturacionPage implements OnInit {

  orderId: any;
  details: any[] = [];
  total: number = 0;

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.loadOrder();
  }

  loadOrder() {
    this.server.getOrderDetails(this.orderId)
      .subscribe((res: any) => {

        if (res.error === 0) {
          this.details = res.data;
          this.calculateTotal();
        }

      });
  }

  calculateTotal() {
    this.total = 0;
    this.details.forEach(d => {
      this.total += Number(d.total_price);
    });
  }
  closeOrder() {
  this.server.closeOrder(this.orderId)
    .subscribe(() => {
      alert("Pago realizado");
    });
}
}