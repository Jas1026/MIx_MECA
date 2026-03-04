import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ViewOrderProductsComponent } from 'src/app/modals/view-order-products/view-order-products.component';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-pedidos-unitarios',
  templateUrl: './pedidos-unitarios.page.html',
  styleUrls: ['./pedidos-unitarios.page.scss'],
})
export class PedidosUnitariosPage implements OnInit, OnDestroy {

  private clockInterval: any;

  fechaMostrada: string = '';
  meseros: any[] = [];
  meseroSeleccionado: string = '';
  estadoSeleccionado: string = '';
  pedidos: any[] = [];
  fechaFiltro: string = '';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.server.getWaiters().subscribe((res: any) => {
      this.meseros = res.data;
    });

    this.cargarPedidos();
    this.startClock();
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  cargarPedidos() {
    const userId = localStorage.getItem("user_id");

    this.server.getOrdersByUser(userId!)
      .subscribe((res: any) => {
        if (res.error === 0) {

          this.pedidos = res.data.map((p: any) => ({
            ...p,
            timeDisplay: '0.00'
          }));

          this.updateAllClocks();
        }
      });
  }

  get pedidosFiltrados() {
    return this.pedidos.filter(p => {
      if (this.meseroSeleccionado && p.mesero !== this.meseroSeleccionado) return false;
      if (this.estadoSeleccionado && p.status !== this.estadoSeleccionado) return false;

      if (this.fechaFiltro) {
        const fechaPedido = new Date(p.order_date).toISOString().split('T')[0];
        if (fechaPedido !== this.fechaFiltro) return false;
      }

      return true;
    });
  }

  limpiarFecha() {
    this.fechaFiltro = '';
    this.fechaMostrada = '';
  }

  fechaSeleccionada(event: any, modal: any) {
    const fecha = event.detail.value;
    if (fecha) {
      const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
      this.fechaFiltro = fechaFormateada;
      this.fechaMostrada = fechaFormateada;
      modal.dismiss();
    }
  }

  startClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    this.clockInterval = setInterval(() => {
      this.updateAllClocks();
    }, 1000);
  }
  private updateAllClocks() {
  const now = new Date().getTime();

  this.pedidos = this.pedidos.map(pedido => {
    
    // 1️⃣ SI ESTÁ CERRADO: Usamos el tiempo real de la base de datos
    if (pedido.status === 'closed') {
      // Tomamos el actual_time (ej: 1.15), lo forzamos a 2 decimales y cambiamos . por :
      const tiempoGuardado = parseFloat(pedido.actual_time || '0').toFixed(2);
      return {
        ...pedido,
        timeDisplay: tiempoGuardado.replace('.', ':') 
      };
    }

    // 2️⃣ SI ESTÁ ABIERTO: Calculamos el cronómetro en vivo
    if (pedido.order_date) {
      const dateStr = pedido.order_date.replace(' ', 'T');
      const startTime = new Date(dateStr).getTime();
      const diffMs = now - startTime;

      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        return {
          ...pedido,
          timeDisplay: `${mins}:${secs.toString().padStart(2, '0')}`
        };
      }
    }
    return pedido;
  });
}

  getTimerClassPedido(pedido: any): string {
    const transcurrido = parseFloat(pedido.timeDisplay || '0');
    const estimado = parseInt(pedido.estimated_total_time) || 0;

    if (pedido.status === 'ready') {
      return 'ready';
    }

    if (estimado > 0 && transcurrido >= estimado) {
      return 'delayed';
    }

    return 'normal';
  }

  getReadyMessage(pedido: any): string {
    if (pedido.status === 'ready') {
      return 'Pedido listo, solo debes entregarlo';
    }
    return '';
  }

    async View_Order(p: any) {
      const modal = await this.modalCtrl.create({
        component: ViewOrderProductsComponent,
        componentProps: {
          order_id: p.order_id,
          editMode: true
        }
      });
  
      modal.onDidDismiss().then(res => {
        if (res.data) {
          this.cargarPedidos();
        }
      });
  
      await modal.present();
    }
  
}