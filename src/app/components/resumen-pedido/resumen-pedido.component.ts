import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resumen-pedido',
  templateUrl: './resumen-pedido.component.html',
  styleUrls: ['./resumen-pedido.component.scss']
})
export class ResumenPedidoComponent implements OnInit {
  @Input() orderId!: number;

  segmento = 'items';
  itemsPendientes: any[] = []; 
  pagosTemporales: any[] = []; 
  
  metodoPagoActual = 'efectivo';
  numPartes = 2;
  montoManual = 0;
  cargoExtra = 0;
  motivoExtra = '';
  // Se añade voucher a la estructura inicial
  datosFactura = { nit: '0', razonSocial: 'SIN NOMBRE', voucher: '' };

  constructor(
    private server: ServerContentService, 
    private modalCtrl: ModalController, 
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.server.getOrderDetails(this.orderId).subscribe((res: any) => {
      const data = res.data || [];
      this.itemsPendientes = [];
      data.filter((item: any) => item.estado_pago !== 'pagado')
          .forEach((item: any) => {
            for (let i = 0; i < Number(item.quantity); i++) {
              this.itemsPendientes.push({ 
                ...item, 
                detail_id: item.detail_id,
                nombre_producto: item.nombre_producto,
                selected: false,
                unit_val: Number(item.unit_price)
              });
            }
          });
    });
  }

  get totalRestanteEnMesa(): number {
    return this.itemsPendientes.reduce((sum, i) => sum + i.unit_val, 0);
  }

  get montoSegunModo(): number {
    if (this.segmento === 'items') {
      return this.itemsPendientes.filter(i => i.selected).reduce((sum, i) => sum + i.unit_val, 0);
    } else if (this.segmento === 'partes') {
      return this.totalRestanteEnMesa;
    } else {
      return this.montoManual;
    }
  }

  get totalACobrarAhora(): number {
    const base = this.segmento === 'partes' ? this.totalRestanteEnMesa : this.montoSegunModo;
    return base + Number(this.cargoExtra || 0);
  }

  get totalAcumuladoCanasta(): number {
    return this.pagosTemporales.reduce((sum, p) => sum + p.monto, 0);
  }

  agregarPago() {
    const extra = Number(this.cargoExtra || 0);
    
    if (this.segmento === 'partes') {
      const montoPorCadaParte = this.totalRestanteEnMesa / this.numPartes;
      for (let i = 1; i <= this.numPartes; i++) {
        this.pagosTemporales.push({
          ...this.datosFactura,
          razonSocial: `${this.datosFactura.razonSocial} (${i}/${this.numPartes})`,
          metodo_pago: this.metodoPagoActual,
          voucher: this.metodoPagoActual === 'tarjeta' ? this.datosFactura.voucher : '',
          monto_items: montoPorCadaParte,
          monto_extra: i === 1 ? extra : 0, 
          motivo_extra: i === 1 ? this.motivoExtra : '',
          monto: montoPorCadaParte + (i === 1 ? extra : 0),
          tipo: 'partes',
          items_referencia: [...this.itemsPendientes]
        });
      }
      this.itemsPendientes = []; 
    } else {
      const montoBase = this.montoSegunModo;
      const itemsSeleccionados = this.itemsPendientes.filter(i => i.selected);

      this.pagosTemporales.push({
        ...this.datosFactura,
        metodo_pago: this.metodoPagoActual,
        voucher: this.metodoPagoActual === 'tarjeta' ? this.datosFactura.voucher : '',
        monto_items: montoBase,
        monto_extra: extra,
        motivo_extra: this.motivoExtra,
        monto: montoBase + extra,
        tipo: this.segmento,
        items_referencia: this.segmento === 'items' ? itemsSeleccionados : []
      });

      if (this.segmento === 'items') {
        this.itemsPendientes = this.itemsPendientes.filter(i => !i.selected);
      }
    }
    this.resetFormulario();
  }

  quitarPago(pago: any, index: number) {
    if (pago.tipo === 'items' || pago.tipo === 'partes') {
      pago.items_referencia.forEach((item: any) => {
        item.selected = false;
        this.itemsPendientes.push(item);
      });
    }
    this.pagosTemporales.splice(index, 1);
  }

  resetFormulario() {
    this.cargoExtra = 0;
    this.motivoExtra = '';
    this.montoManual = 0;
    this.datosFactura = { nit: '0', razonSocial: 'SIN NOMBRE', voucher: '' };
  }

  async confirmarTodo() {
    const payload = {
      order_id: this.orderId,
      pagos: this.pagosTemporales.map(p => ({
        nit: p.nit,
        razonSocial: p.razonSocial,
        metodo_pago: p.metodo_pago,
        voucher: p.voucher || '', // Incluimos voucher en el envío al servidor
        monto: p.monto,
        monto_extra: p.monto_extra,
        motivo_extra: p.motivo_extra,
        detalle_ids: p.items_referencia.reduce((acc: any, item: any) => {
          const id = item.detail_id; 
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {})
      })),
      system: localStorage.getItem('sistema') || 'mixtura'
    };

    this.server.procesarMultiplesPagos(payload).subscribe((res: any) => {
      if (res.error === 0) {
        this.server.closeOrder(this.orderId).subscribe(() => {
          this.modalCtrl.dismiss(true);
          this.router.navigate(['/facturacion', this.orderId]);
        });
      }
    });
  }

  seleccionarTexto(input: any) {
    setTimeout(() => {
      input.getInputElement().then((nativeInput: HTMLInputElement) => {
        nativeInput.select();
      });
    }, 50);
  }

  cerrar() { this.modalCtrl.dismiss(); }
}