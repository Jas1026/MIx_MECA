import { Component, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController, AlertController, ToastController } from '@ionic/angular'; // 👈 Inyectamos Alert y Toast
import { IonDatetime } from '@ionic/angular';
import { OrderModalComponent } from 'src/app/components/order-modal/order-modal.component';
import { ViewOrderProductsComponent } from 'src/app/modals/view-order-products/view-order-products.component';

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
userRole: string = '';
  soloAtrasados: boolean = false;
private clockInterval: any;
  constructor(
    private server: ServerContentService, 
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, // 👈 Añadido
    private toastCtrl: ToastController   // 👈 Añadido
  ) {}

 ngOnInit() {
  this.cargarDatosUsuario();
  
  // Carga inicial de datos
  this.server.getWaiters().subscribe((res: any) => {
    this.meseros = res.data;
  });
  this.cargarPedidos();
  this.startClock();
}
ionViewWillEnter() {
    this.cargarDatosUsuario();
  }
cargarDatosUsuario() {
  // Usamos 'role' que es la clave que sí funciona en tu Panel
  const savedRole = sessionStorage.getItem('role'); 
  this.userRole = savedRole ? savedRole.trim().toLowerCase() : '';
  
  console.log("PEDIDOS PAGE -> Rol verificado:", this.userRole);
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

    // ===============================
    // 1️⃣ FILTRO POR MESERO
    // ===============================
    if (this.meseroSeleccionado && p.mesero !== this.meseroSeleccionado) {
      return false;
    }



if (this.estadoSeleccionado) {

  // CANCELADOS
  if (this.estadoSeleccionado === 'cancel' && p.cancel != 1) {
    return false;
  }

  // FINALIZADOS
  if (this.estadoSeleccionado === 'closed' && (p.status !== 'closed' || p.cancel == 1)) {
    return false;
  }

  // ABIERTOS
  if (this.estadoSeleccionado === 'open' && p.status !== 'open') {
    return false;
  }

}

    // ===============================
    // 3️⃣ FILTRO POR DÍA OPERATIVO (5AM - 4:59AM)
    // ===============================
    if (this.fechaFiltro) {

      // Separar manualmente año, mes y día
      const [year, month, day] = this.fechaFiltro.split('-').map(Number);

      // Inicio del día operativo (5:00 AM hora local)
      const inicio = new Date(year, month - 1, day, 5, 0, 0, 0);

      // Fin del día operativo (4:59:59 del día siguiente)
      const fin = new Date(year, month - 1, day + 1, 4, 59, 59, 999);

      // Convertir fecha del pedido correctamente
      const fechaPedido = new Date(p.order_date.replace(' ', 'T'));

      if (fechaPedido < inicio || fechaPedido > fin) {
        return false;
      }
    }

    // ===============================
    // 4️⃣ FILTRO SOLO ATRASADOS
    // ===============================
    if (this.soloAtrasados && !p.isDelayed) {
      return false;
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

  // 👇 NUEVOS MÉTODOS PARA CERRAR ORDEN 👇

  async finalizarPedido(p: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cierre',
      message: `¿Estás seguro de cerrar el pedido PED-${p.order_id}? Esto liberará la mesa automáticamente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.ejecutarCierre(p.order_id);
          }
        }
      ]
    });
    await alert.present();
  }

  ejecutarCierre(id: number) {
    this.server.closeOrder_for(id).subscribe((res: any) => {
      if (res.error === 0) {
        this.presentToast("Orden finalizada y mesa liberada", "success");
        this.cargarPedidos(); // Refresca la tabla
      } else {
        this.presentToast("Error al cerrar: " + res.message, "danger");
      }
    });
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
ngOnDestroy() {
  if (this.clockInterval) {
    clearInterval(this.clockInterval);
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

    const estimado = parseFloat(pedido.estimated_time || '0');

    // ===============================
    // 1️⃣ SI ESTÁ CERRADO
    // ===============================
    if (pedido.status === 'closed') {

      const actual = parseFloat(pedido.actual_time || '0'); // minutos decimales

      const minutos = Math.floor(actual);
      const segundos = Math.floor((actual - minutos) * 60);

      let delay = 0;

      if (estimado > 0 && actual > estimado) {
        delay = actual - estimado;
      }

      const delayMin = Math.floor(delay);
      const delaySec = Math.floor((delay - delayMin) * 60);

      return {
        ...pedido,
        timeDisplay: `${minutos}:${segundos.toString().padStart(2, '0')}`,
        delayTime: delay > 0
          ? `${delayMin}:${delaySec.toString().padStart(2, '0')}`
          : '0:00',
        isDelayed: delay > 0
      };
    }

    // ===============================
    // 2️⃣ SI ESTÁ ABIERTO
    // ===============================
    if (pedido.order_date) {

      const dateStr = pedido.order_date.replace(' ', 'T');
      const startTime = new Date(dateStr).getTime();
      const diffMs = now - startTime;

      if (diffMs > 0) {

        const totalSeconds = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        let delay = 0;

        if (estimado > 0 && mins > estimado) {
          delay = mins - estimado;
        }

        return {
          ...pedido,
          timeDisplay: `${mins}:${secs.toString().padStart(2, '0')}`,
          delayTime: delay > 0 ? `${delay}:00` : '0:00',
          isDelayed: delay > 0
        };
      }
    }

    return pedido;
  });
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


hasRole(roleName: string): boolean {
  // Si no hay rol, no mostramos nada
  if (!this.userRole) return false;

  // Forzamos la comparación limpia
  const actualRole = this.userRole.trim().toLowerCase();
  const requiredRole = roleName.trim().toLowerCase();

  return actualRole === requiredRole;
}
}