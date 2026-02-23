import { Component, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController } from '@ionic/angular';
import { IonDatetime } from '@ionic/angular';
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
meseros: any[] = [];
meseroSeleccionado: string = '';
estadoSeleccionado: string = '';
fechaSeleccionada: string = '';
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

      if (!p.order_date) return false;

      // Convertimos ambas fechas a YYYY-MM-DD
      const fechaPedido = new Date(p.order_date)
        .toISOString()
        .split('T')[0];

      const fechaSeleccionada = new Date(this.fechaFiltro)
        .toISOString()
        .split('T')[0];

      if (fechaPedido !== fechaSeleccionada) {
        return false;
      }
    }

    return true;
  });

}


async abrirCalendario() {

  const modal = await this.modalCtrl.create({
    component: IonDatetime,
    componentProps: {
      presentation: 'date'
    }
  });

  await modal.present();

  const { data } = await modal.onWillDismiss();

  if (data?.value) {
    this.fechaSeleccionada = data.value.split('T')[0];
  }

}

}