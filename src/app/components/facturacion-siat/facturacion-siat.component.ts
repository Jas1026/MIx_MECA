import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-facturacion-siat',
  templateUrl: './facturacion-siat.component.html',
  styleUrls: ['./facturacion-siat.component.scss']
})
export class FacturacionSiatComponent implements OnInit {
  @Input() orderId!: number;
  @Input() formatoImpresion: string = '80';
  // 🔥 RECIBE LA CANASTA DE PAGOS TEMPORALES DESDE EL OTRO COMPONENTE
  @Input() pagosPreCargados: any[] = []; 

  today: Date = new Date();
  detallesTotales: any[] = [];
  historialPagos: any[] = [];
  totalGeneral: number = 0;
  
  facturasGeneradas: any[] = [];
  facturacionExitosa: boolean = false;

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private router: Router,
    private toast: ToastController,
    private loader: LoadingController
  ) { }

  ngOnInit() {
    this.cargarResumenFactura();
  }

  cargarResumenFactura() {
    // 1. Cargamos los productos asociados al pedido de la mesa
    this.server.getOrderProducts(this.orderId).subscribe((res: any) => {
      const data = res.productos || [];
      this.detallesTotales = data.map((item: any) => ({
        quantity: Number(item.quantity),
        nombre_producto: item.producto,
        total_price: Number(item.unit_price) * Number(item.quantity)
      }));
      
      this.totalGeneral = this.detallesTotales.reduce((sum, item) => sum + item.total_price, 0);
    });

    // 2. 🔥 EVALUACIÓN DE LA CANASTA
    // Si ya le pasamos pagos desde la pantalla anterior, los usamos directamente
    if (this.pagosPreCargados && this.pagosPreCargados.length > 0) {
      this.historialPagos = this.pagosPreCargados.map((p: any) => ({
        // Homologamos las llaves para que coincidan con la estructura que espera tu PHP
        nit_cliente: p.nit,
        razon_social: p.razonSocial,
        metodo_pago: p.metodo_pago,
        voucher: p.voucher || '',
        monto_total: p.monto
      }));
    } else {
      // Si por alguna razón entró vacío, intentamos recuperar lo que haya guardado en la BD
      this.server.getPagosParciales(this.orderId).subscribe((res: any) => {
        if (res.error === 0 && res.data) {
          this.historialPagos = res.data;
        }
      });
    }
  }

  async procesarFacturacionCajas() {
    if (this.historialPagos.length === 0) {
      this.presentToast('No existen pagos asignados para proceder con la facturación', 'danger');
      return;
    }

    const loading = await this.loader.create({
      message: 'Enviando paquetes a Impuestos SIAT...',
    });
    await loading.present();

    // Construcción del Payload idéntico para el backend en PHP
    const payload = {
      order_id: this.orderId,
      formato: this.formatoImpresion,
      pagos: this.historialPagos.map((p: any) => ({
        nit: p.nit_cliente || '0',
        razonSocial: p.razon_social || 'SIN NOMBRE',
        montoTotal: Number(p.monto_total),
        metodoPago: p.metodo_pago === 'efectivo' ? 1 : 2,
        detalles: this.detallesTotales.map((item: any) => ({
          descripcion: item.nombre_producto,
          precio: Number(item.total_price) / Number(item.quantity),
          cantidad: Number(item.quantity)
        }))
      }))
    };

    this.server.procesarFacturacionSiat(payload).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        if (res.success) {
          this.facturasGeneradas = res.facturas;
          this.facturacionExitosa = true;
          this.presentToast('Facturación Procesada con Éxito ✅', 'success');
          
          if (res.facturas && res.facturas.length > 0 && res.facturas[0].pdf) {
            window.open(res.facturas[0].pdf, '_blank');
          }
        } else {
          this.presentToast(res.message || 'Error en validación SIAT ❌', 'danger');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        this.presentToast('Fallo crítico de red o del script PHP ❌', 'danger');
      }
    });
  }

  abrirPdf(urlPdf: string) {
    if (urlPdf) {
      window.open(urlPdf, '_blank');
    }
  }

  async finalizarProceso() {
    // 3. 🔥 REGISTRO FINAL EN BD ANTES DE ARCHIVAR
    // Como los pagos estaban en la canasta local y no en la BD, primero llamamos 
    // a tu endpoint para asentar el historial completo en el sistema.
    const payloadPagos = {
      order_id: this.orderId,
      pagos: this.historialPagos.map(p => ({
        user_id: sessionStorage.getItem('user_id'),
        nit: p.nit_cliente,
        razonSocial: p.razon_social,
        metodo_pago: p.metodo_pago,
        voucher: p.voucher || '',
        monto: p.monto_total,
        detalle_ids: {} // Se procesa el global de la orden directamente por backend
      })),
      system: sessionStorage.getItem('sistema') || 'mixtura',
      parcial: 0
    };

    // Subimos los pagos definitivos a la base de datos
    this.server.procesarMultiplesPagos(payloadPagos).subscribe({
      next: (res: any) => {
        // Una vez guardados con éxito, cerramos la orden de la mesa de forma definitiva
        this.server.closeOrder(this.orderId, sessionStorage.getItem('user_id')).subscribe({
          next: () => {
            this.presentToast('Mesa finalizada y archivada de cajas. ✅', 'success');
            this.modalCtrl.dismiss(true);
            this.router.navigate(['/panel']);
          },
          error: () => this.presentToast('Error al cerrar el estado de la mesa.', 'danger')
        });
      },
      error: () => this.presentToast('Error al asentar los pagos en la base de datos.', 'danger')
    });
  }

  volver() {
    this.modalCtrl.dismiss();
  }

  async presentToast(msg: string, col: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2500,
      color: col
    });
    t.present();
  }
}