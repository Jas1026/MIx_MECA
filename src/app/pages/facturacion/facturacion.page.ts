import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.page.html',
  styleUrls: ['./facturacion.page.scss'],
})
export class FacturacionPage implements OnInit {

  orderId: string = '';
  detalles: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  today: Date = new Date();

  // 🔥 DATOS CLIENTE
  cliente = {
    nombre: '',
    nit: ''
  };

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService,
    private router: Router
  ) {}

  ngOnInit() {

    this.orderId = this.route.snapshot.paramMap.get('id') || '';

    this.server.getOrderDetails(Number(this.orderId))
      .subscribe((res: any) => {

        if (res.error === 0) {

          this.detalles = res.data;

          this.subtotal = this.detalles.reduce(
            (sum, item) => sum + Number(item.total_price), 0
          );

          this.total = this.subtotal;

        }

      });

  }
  imprimir() {

  if (!this.cliente.nombre || !this.cliente.nit) {
    alert("Debe completar Nombre y NIT");
    return;
  }

  this.server.saveInvoiceData(
    Number(this.orderId),
    this.cliente.nombre,
    this.cliente.nit
  ).subscribe(() => {

    window.print();

  });

}

  volverMesas() {
    this.router.navigate(['/panel']);
  }
// facturacion.page.ts
emitirFacturaSIAT() {
  if (!this.cliente.nombre || !this.cliente.nit) {
    alert("Datos de facturación requeridos");
    return;
  }

  // Mostramos un cargando (LoadingController de Ionic recomendado)
  this.server.emitirFacturaReal(Number(this.orderId), this.cliente, this.detalles)
    .subscribe((res: any) => {
      if (res.status === 'SUCCESS') {
        // Cucu devuelve una URL del PDF o el CUF
        const urlFactura = res.pdf_url; 
        window.open(urlFactura, '_blank'); // Abre la factura oficial de Impuestos
        
        // Cerramos la mesa en nuestro sistema
        this.finalizarProceso();
      } else {
        alert("Error de Impuestos: " + res.message);
      }
    });
}

finalizarProceso() {
  // Aquí llamas a tu PHP de close_order.php que ya tienes creado
  this.server.closeOrder(Number(this.orderId)).subscribe(() => {
  this.router.navigate(['/panel']);
});
}
}