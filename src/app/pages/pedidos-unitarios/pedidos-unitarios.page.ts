import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { OrderModalComponent } from 'src/app/components/order-modal/order-modal.component';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-pedidos-unitarios',
  templateUrl: './pedidos-unitarios.page.html',
  styleUrls: ['./pedidos-unitarios.page.scss'],
})
export class PedidosUnitariosPage implements OnInit {

  fechaMostrada: string = '';
  meseros: any[] = [];
  meseroSeleccionado: string = '';
  estadoSeleccionado: string = '';
  pedidos: any[] = [];
  filtroMesero: string = '';
  fechaFiltro: string = '';

  constructor(
    private server: ServerContentService, 
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, // 👈 Añadido
    private toastCtrl: ToastController   // 👈 Añadido
  ) {}

  ngOnInit() {
    this.server.getWaiters().subscribe((res: any) => {
      this.meseros = res.data;
    });
    this.cargarPedidos();
    this.server.getWaiters().subscribe((res: any) => {
      console.log("Respuesta de meseros:", res); 
      this.meseros = res.data;
    });
    this.cargarPedidos();
  }
cargarPedidos() {
  const userId = localStorage.getItem("user_id");

  this.server.getOrdersByUser(userId!)
    .subscribe((res: any) => {
      if (res.error === 0) {
        this.pedidos = res.data;
      }
    });
}
  get pedidosFiltrados() {
    return this.pedidos.filter(p => {
      if (this.meseroSeleccionado && p.mesero !== this.meseroSeleccionado) {
        return false;
      }
      if (this.estadoSeleccionado && p.status !== this.estadoSeleccionado) {
        return false;
      }
      if (this.fechaFiltro) {
        const fechaPedido = new Date(p.order_date).toISOString().split('T')[0];
        if (fechaPedido !== this.fechaFiltro) {
          return false;
        }
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


  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
