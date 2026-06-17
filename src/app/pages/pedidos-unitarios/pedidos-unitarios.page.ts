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

  pisoSeleccionado: string = '';
  pisos: any[] = [];

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
    this.cargarPisos()
    this.cargarPedidos();
    this.startClock();
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  cargarPedidos() {
    const userId = sessionStorage.getItem("user_id");

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

  let lista = [...this.pedidos];

  lista = lista.filter(p => {

    if (
      this.estadoSeleccionado &&
      (
        this.estadoSeleccionado === 'cancel'
          ? (p.status !== 'cancel' && p.cancel != 1)
          : p.status !== this.estadoSeleccionado
      )
    ) {
      return false;
    }

    if (
      this.pisoSeleccionado &&
      p.nombre_piso !== this.pisoSeleccionado
    ) {
      return false;
    }

    if (this.fechaFiltro) {

      const fechaPedido =
        new Date(p.order_date)
          .toISOString()
          .split('T')[0];

      if (fechaPedido !== this.fechaFiltro) {
        return false;
      }
    }

    if (
      this.filtros.nombre_mesa &&
      !String(p.nombre_mesa)
        .toLowerCase()
        .includes(this.filtros.nombre_mesa.toLowerCase())
    ) {
      return false;
    }

    if (
      this.filtros.nombre_piso &&
      !String(p.nombre_piso)
        .toLowerCase()
        .includes(this.filtros.nombre_piso.toLowerCase())
    ) {
      return false;
    }

    if (
      this.filtros.order_date &&
      !String(p.order_date)
        .toLowerCase()
        .includes(this.filtros.order_date.toLowerCase())
    ) {
      return false;
    }

    if (
      this.filtros.status &&
      !String(p.status)
        .toLowerCase()
        .includes(this.filtros.status.toLowerCase())
    ) {
      return false;
    }

    return true;

  });

  if (this.sortColumn) {

    lista.sort((a, b) => {

      const valorA =
        String(a[this.sortColumn] ?? '')
        .toLowerCase();

      const valorB =
        String(b[this.sortColumn] ?? '')
        .toLowerCase();

      const resultado =
        valorA > valorB ? 1 :
        valorA < valorB ? -1 : 0;

      return this.sortDirection === 'asc'
        ? resultado
        : -resultado;

    });

  }

  return lista;
}
ordenar(columna: string) {

  if (this.sortColumn === columna) {

    this.sortDirection =
      this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

  } else {

    this.sortColumn = columna;
    this.sortDirection = 'asc';

  }

  this.paginaActual = 1;
}
paginaActual = 1;

itemsPorPagina = 10;

opcionesPagina = [5, 10, 30];
get totalPaginas(): number {

  return Math.ceil(
    this.pedidosFiltrados.length /
    this.itemsPorPagina
  ) || 1;

}
get pedidosPaginados() {

  const inicio =
    (this.paginaActual - 1)
    * this.itemsPorPagina;

  const fin =
    inicio + this.itemsPorPagina;

  return this.pedidosFiltrados.slice(
    inicio,
    fin
  );
}
paginaAnterior() {

  if (this.paginaActual > 1) {
    this.paginaActual--;
  }

}

paginaSiguiente() {

  if (
    this.paginaActual <
    this.totalPaginas
  ) {
    this.paginaActual++;
  }

}

cambiarItemsPorPagina() {

  this.paginaActual = 1;

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
  cargarPisos() {
  // Asegúrate de tener este método en tu servicio server-content
  this.server.getFlats_panel().subscribe((res: any) => {
    if(res.error === 0) {
      this.pisos = res.data;
    }
  });
}
limpiarFiltros() {

  this.fechaFiltro = '';
  this.fechaMostrada = '';

  this.estadoSeleccionado = '';
  this.pisoSeleccionado = '';
  this.meseroSeleccionado = '';

  this.filtros = {
    nombre_mesa: '',
    nombre_piso: '',
    order_date: '',
    status: '',
    estimated_total_time: ''
  };

  this.sortColumn = '';
  this.sortDirection = 'asc';

  this.paginaActual = 1;
}
async cambiarMesa(pedido: any) {
  this.server.getFlats().subscribe(async (res: any) => {
    
    if (!res.data || res.data.length === 0) {
      this.presentToast("No se encontraron áreas configuradas.");
      return;
    }

    const inputsPisos = res.data.map((p: any) => ({
      type: 'radio',
      label: p.name,
      // CAMBIO AQUÍ: Debe ser Id_flats para coincidir con tu JSON
      value: p.Id_flats, 
      checked: p.name === pedido.nombre_piso
    }));

    const alertPisos = await this.alertCtrl.create({
      header: 'Seleccionar Piso / Área',
      subHeader: `Mesa actual: ${pedido.nombre_mesa}`,
      inputs: inputsPisos,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (idFlatSeleccionado) => {
            // Ahora idFlatSeleccionado ya no será undefined
            if (idFlatSeleccionado) {
              this.seleccionarNuevaMesa(pedido, idFlatSeleccionado);
              return true;
            } else {
              this.presentToast("Por favor, selecciona un área.");
              return false;
            }
          }
        }
      ]
    });

    await alertPisos.present();
  });
}
async seleccionarNuevaMesa(pedido: any, id_flat: any) {
  console.log("Cargando mesas para el piso ID:", id_flat);

  if (!id_flat) {
    this.presentToast("Error: No se seleccionó un piso válido");
    return;
  }

  this.server.getTables_new(id_flat).subscribe(async (res: any) => {
    
    if (!res.data || res.data.length === 0) {
      this.presentToast("No hay mesas registradas en este área");
      return;
    }

    const inputsMesas = res.data.map((m: any) => ({
      type: 'radio',
      label: m.nombre, 
      value: m.id_table,
    }));

    const alertMesas = await this.alertCtrl.create({
      header: 'Seleccionar Nueva Mesa',
      inputs: inputsMesas,
      buttons: [
        { text: 'Atrás', handler: () => this.cambiarMesa(pedido) },
        {
          text: 'Cambiar',
          handler: (id_table) => {
            if (id_table) {
              this.confirmarCambio(pedido.order_id, id_table);
              return true; // <--- Agregamos retorno explícito
            } else {
              this.presentToast("Debes seleccionar una mesa");
              return false; // Evita que se cierre el alert
            }
          }
        }
      ]
    });
    await alertMesas.present();
  });
}
confirmarCambio(orderId: number, newTableId: number) {
  this.server.changeOrderTable(orderId, newTableId).subscribe((res: any) => {
    if (res.error === 0) {
      this.cargarPedidos(); // Recargar la lista
      this.presentToast("Mesa cambiada correctamente");
    }
  });
}

async presentToast(msg: string) {
  const toast = await this.toastCtrl.create({ message: msg, duration: 2000 });
  toast.present();
}
filtros = {
  nombre_mesa: '',
  nombre_piso: '',
  order_date: '',
  status: '',
  estimated_total_time: ''
};

sortColumn = '';
sortDirection: 'asc' | 'desc' = 'asc';

}