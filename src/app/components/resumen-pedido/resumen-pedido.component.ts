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
  //PARA GENERACION DE FACTURACIÓN 
  // En ResumenPedidoComponent
datosFactura = {
  nit: '0',
  razonSocial: 'SIN NOMBRE'
};

generarFacturaSIAT() {
  if (!this.datosFactura.nit || !this.datosFactura.razonSocial) {
    alert("Por favor rellena los datos del cliente");
    return;
  }

  const payload = {
    order_id: this.orderId,
    nit: this.datosFactura.nit,
    razonSocial: this.datosFactura.razonSocial,
    total: this.total,
    detalles: this.detalles // Enviamos los productos para el XML
  };

  this.server.emitirFacturaReal(payload).subscribe((res: any) => {
    if (res.error === 0) {
      alert("Factura emitida con éxito. CUF: " + res.cuf);
      this.modalCtrl.dismiss(true);
      this.router.navigate(['/facturacion-exito', res.id_factura]); 
    } else {
      alert("Error SIAT: " + res.message);
    }
  });
}

}