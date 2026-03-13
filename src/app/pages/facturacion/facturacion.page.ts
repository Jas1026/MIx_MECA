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

  // DATOS CLIENTE
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
    this.cargarDetalles();
  }

  cargarDetalles() {
    this.server.getOrderDetails(Number(this.orderId))
      .subscribe((res: any) => {
        if (res.error === 0) {
          this.detalles = res.data;
          this.total = this.detalles.reduce(
            (sum, item) => sum + Number(item.total_price), 0
          );
        }
      });
  }

  emitirFacturaSIAT() {
    if (!this.cliente.nombre || !this.cliente.nit) {
      alert("Por favor, complete los datos de facturación (Nombre y NIT)");
      return;
    }

    // CREAMOS UN SOLO OBJETO (Payload) para evitar el error TS2554
    const payload = {
      order_id: Number(this.orderId),
      nit: this.cliente.nit,
      razonSocial: this.cliente.nombre,
      total: this.total,
      detalles: this.detalles
    };

    console.log("Enviando al SIAT:", payload);

    this.server.emitirFacturaReal(payload).subscribe({
      next: (res: any) => {
        if (res.error === 0) {
          alert("Factura emitida con éxito. CUF: " + res.cuf);
          // Opcional: imprimir automáticamente después de generar en SIAT
          setTimeout(() => window.print(), 500);
          this.router.navigate(['/panel']);
        } else {
          alert("Error de Impuestos: " + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert("Error de conexión con el servidor");
      }
    });
  }

  imprimir() {
    if (!this.cliente.nombre || !this.cliente.nit) {
      alert("Debe completar Nombre y NIT para la impresión");
      return;
    }
    window.print();
  }

  volverMesas() {
    this.router.navigate(['/panel']);
  }
}