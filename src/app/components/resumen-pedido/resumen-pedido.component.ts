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
  itemsPendientes: any[] = []; // Items que aún no están ni pagados ni en canasta
  pagosTemporales: any[] = []; // La "Canasta"
  
  metodoPagoActual = 'efectivo';
  numPartes = 2;
  montoManual = 0;
  cargoExtra = 0;
  motivoExtra = '';
  datosFactura = { nit: '0', razonSocial: 'SIN NOMBRE' };

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
      
      // Solo cargamos lo que NO está pagado en la base de datos
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

  // --- LÓGICA DE CÁLCULOS ---

  get totalDeudaOriginal(): number {
    // Suma de todo lo que falta pagar (items en lista + items que movimos a la canasta)
    const enLista = this.itemsPendientes.reduce((sum, i) => sum + i.unit_val, 0);
    const enCanasta = this.pagosTemporales
      .filter(p => p.tipo === 'items')
      .reduce((sum, p) => sum + p.monto_items, 0);
    
    // Sumamos también los montos manuales o partes que ya están en canasta
    const otrosEnCanasta = this.pagosTemporales
      .filter(p => p.tipo !== 'items')
      .reduce((sum, p) => sum + p.monto_items, 0);

    return enLista + enCanasta + otrosEnCanasta;
  }

  get totalRestanteEnMesa(): number {
    const pagadoEnCanasta = this.pagosTemporales.reduce((sum, p) => sum + p.monto_items, 0);
    const deuda = this.itemsPendientes.reduce((sum, i) => sum + i.unit_val, 0);
    return deuda; 
  }

  get montoSegunModo(): number {
    if (this.segmento === 'items') {
      return this.itemsPendientes.filter(i => i.selected).reduce((sum, i) => sum + i.unit_val, 0);
    } else if (this.segmento === 'partes') {
      return this.totalRestanteEnMesa; // El total a dividir
    } else {
      return this.montoManual;
    }
  }

  get totalACobrarAhora(): number {
    // Para el botón de "Añadir", sumamos el monto del modo + el extra actual
    const base = this.segmento === 'partes' ? this.totalRestanteEnMesa : this.montoSegunModo;
    return base + Number(this.cargoExtra || 0);
  }

  get totalAcumuladoCanasta(): number {
    return this.pagosTemporales.reduce((sum, p) => sum + p.monto, 0);
  }

  // --- ACCIONES ---

  agregarPago() {
    const extra = Number(this.cargoExtra || 0);
    
    if (this.segmento === 'partes') {
      const montoPorCadaParte = this.totalRestanteEnMesa / this.numPartes;
      for (let i = 1; i <= this.numPartes; i++) {
        this.pagosTemporales.push({
          ...this.datosFactura,
          razonSocial: `${this.datosFactura.razonSocial} (${i}/${this.numPartes})`,
          metodo_pago: this.metodoPagoActual,
          monto_items: montoPorCadaParte,
          monto_extra: i === 1 ? extra : 0, 
          motivo_extra: i === 1 ? this.motivoExtra : '',
          monto: montoPorCadaParte + (i === 1 ? extra : 0),
          tipo: 'partes',
          items_referencia: [...this.itemsPendientes] // Referencia a lo que queda
        });
      }
      this.itemsPendientes = []; // Al dividir por partes, vaciamos los pendientes
    } else {
      const montoBase = this.montoSegunModo;
      const itemsSeleccionados = this.itemsPendientes.filter(i => i.selected);

      this.pagosTemporales.push({
        ...this.datosFactura,
        metodo_pago: this.metodoPagoActual,
        monto_items: montoBase,
        monto_extra: extra,
        motivo_extra: this.motivoExtra,
        monto: montoBase + extra,
        tipo: this.segmento,
        items_referencia: this.segmento === 'items' ? itemsSeleccionados : []
      });

      if (this.segmento === 'items') {
        this.itemsPendientes = this.itemsPendientes.filter(i => !i.selected);
      } else if (this.segmento === 'monto') {
        // Lógica compleja: si es monto manual, tendríamos que prorratear o solo restar del total
        // Por sencillez, el monto manual descuenta del "pozo" total.
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
    this.datosFactura = { nit: '0', razonSocial: 'SIN NOMBRE' };
  }

  async confirmarTodo() {
    const payload = {
      order_id: this.orderId,
      pagos: this.pagosTemporales.map(p => ({
        nit: p.nit,
        razonSocial: p.razonSocial,
        metodo_pago: p.metodo_pago,
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
// Añade esto en tu clase ResumenPedidoComponent
seleccionarTexto(input: any) {
  // Usamos un pequeño timeout porque Ionic a veces tarda un milisegundo 
  // en renderizar el foco nativo
  setTimeout(() => {
    input.getInputElement().then((nativeInput: HTMLInputElement) => {
      nativeInput.select();
    });
  }, 50);
}
  cerrar() { this.modalCtrl.dismiss(); }
}