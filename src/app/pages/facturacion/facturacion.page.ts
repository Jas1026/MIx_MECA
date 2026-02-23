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

}