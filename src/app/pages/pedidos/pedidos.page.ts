import { Component, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController } from '@ionic/angular';
import { IonDatetime } from '@ionic/angular';
import { OrderModalComponent } from 'src/app/components/order-modal/order-modal.component';
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  fechaMostrada: string = '';
meseros: any[] = [];
meseroSeleccionado: string = '';
estadoSeleccionado: string = '';
  pedidos: any[] = [];
  filtroMesero: string = '';
fechaFiltro: string = '';
  constructor(private server: ServerContentService, private modalCtrl: ModalController) {}

  ngOnInit() {
    
  this.server.getWaiters().subscribe((res: any) => {
  this.meseros = res.data;
});
  this.cargarPedidos();
  
  }

  cargarPedidos() {
    this.server.getAllOrders()
      .subscribe((res: any) => {
        if (res.error === 0) {
          this.pedidos = res.data;
        }
      });
  }
get pedidosFiltrados() {

  return this.pedidos.filter(p => {

    if (this.meseroSeleccionado &&
        p.mesero !== this.meseroSeleccionado) {
      return false;
    }

    if (this.estadoSeleccionado &&
        p.status !== this.estadoSeleccionado) {
      return false;
    }

    if (this.fechaFiltro) {

      const fechaPedido = new Date(p.order_date)
        .toISOString()
        .split('T')[0];

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

    const fechaFormateada = new Date(fecha)
      .toISOString()
      .split('T')[0];

    this.fechaFiltro = fechaFormateada;
    this.fechaMostrada = fechaFormateada;

    modal.dismiss(); // 👈 AQUÍ LO CERRAMOS

  }

}

async editarPedido(p: any) {

  const modal = await this.modalCtrl.create({
    component: OrderModalComponent,
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