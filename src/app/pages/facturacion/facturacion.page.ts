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
  detallesTotales: any[] = [];
  historialPagos: any[] = [];
  totalGeneral: number = 0;
  today: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarResumenFinal();
  }
cargarResumenFinal() {
  // Solo mostramos lo que YA ESTÁ PAGADO para el ticket final
  this.server.getOrderDetails(Number(this.orderId)).subscribe((res: any) => {
    if (res.error === 0) {
      // Filtramos solo los pagados para que el ticket no muestre lo que quedó pendiente (si fue pago parcial)
      this.detallesTotales = res.data.filter((d:any) => d.estado_pago === 'pagado');
      this.totalGeneral = this.detallesTotales.reduce((sum, item) => sum + Number(item.total_price), 0);
    }
  });

  this.server.getHistorialPagos(Number(this.orderId)).subscribe((res: any) => {
    if (res.error === 0) {
      this.historialPagos = res.data;
    }
  });
}
  imprimir() {
    window.print();
  }

  volverMesas() {
    this.router.navigate(['/panel']);
  }
}