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
  kitchenName: string = '';
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
  this.server.getKitchenOrders(this.kitchenId).subscribe((res: any) => {
    if (res.error === 0) {
      this.orders = res.data;
      
      // Si el API te devuelve el nombre de la cocina en la respuesta (ej: res.kitchen_name)
      // lo asignas aquí. Si no, podemos sacarlo del primer item de la lista si existe:
      if (this.orders.length > 0 && this.orders[0].kitchen_name) {
        this.kitchenName = this.orders[0].kitchen_name;
      } else {
        // Un nombre por defecto mientras carga o si no hay pedidos
        this.kitchenName = 'Estación ' + this.kitchenId; 
      }
    }
  });
}
  markReady(detailId: number) {
  this.server.updateDetailStatus(detailId)  // <-- solo 1 argumento
    .subscribe((res: any) => {
      this.loadOrders();

      if (res.order_ready) {
        console.log("Todos los productos listos. Orden lista para entrega!");
      }
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
