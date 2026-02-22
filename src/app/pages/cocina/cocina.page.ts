import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cocina',
  templateUrl: './cocina.page.html',
  styleUrls: ['./cocina.page.scss'],
})
export class CocinaPage implements OnInit {

  kitchenId: any;
  orders: any[] = [];
  intervalId: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private server: ServerContentService
  ) {}
ngOnInit() {
  this.kitchenId = this.route.snapshot.paramMap.get('id');

  console.log("Kitchen ID recibido:", this.kitchenId);

  this.loadOrders();

  this.intervalId = setInterval(() => {
    this.loadOrders();
  }, 5000);
}
ngOnDestroy() {
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
}
loadOrders() {

  this.server.getKitchenOrders(this.kitchenId)
    .subscribe((res: any) => {

      if (res.error === 0) {
        this.orders = res.data;
      }

    });
}
  markReady(detailId: any) {
    this.server.updateDetailStatus(detailId)
      .subscribe(() => {
        this.loadOrders();
      });
  }
  deliver(orderId: number) {
  this.server.deliverOrder(orderId)
    .subscribe((res: any) => {

      if (res.error === 0) {
        // Redirigir a facturación
        this.router.navigate(['/facturacion', orderId]);
      }

    });
}
}
