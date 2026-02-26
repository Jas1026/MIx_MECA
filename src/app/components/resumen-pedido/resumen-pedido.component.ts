import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-resumen-pedido',
  templateUrl: './resumen-pedido.component.html',
})
export class ResumenPedidoComponent implements OnInit {

  @Input() orderId!: number;

  detalles: any[] = [];
  total = 0;

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
     private router: Router
  ) {}

  ngOnInit() {
    this.server.getOrderDetails(this.orderId)
      .subscribe((res: any) => {
this.detalles = res.data || [];

this.total = this.detalles.length > 0
  ? this.detalles.reduce(
      (sum, d) => sum + Number(d.total_price), 0
    )
  : 0;
      });
  }
generarFactura() {
  this.server.closeOrder(this.orderId)
    .subscribe(() => {

      // Cerramos el modal
      this.modalCtrl.dismiss();

      // Vamos a la página de facturación
      this.router.navigate(['/facturacion', this.orderId]);

    });
}
  cerrar() {
    this.modalCtrl.dismiss();
  }
  
}