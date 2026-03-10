import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-view-order-products',
  templateUrl: './view-order-products.component.html',
  styleUrls: ['./view-order-products.component.scss'],
})

export class ViewOrderProductsComponent implements OnInit, OnDestroy {
  @Input() order_id: any;
  productos: any[] = [];
  private timer: any;
private sonidoConfirmacion = new Audio('assets/sounds/confirmacion.mp3');
  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toast: ToastController
  ) {}

ngOnInit() {
  this.cargarProductos();

  // ⏱ reloj
  this.timer = setInterval(() => {
    this.actualizarTiempos();
  }, 1000);

  // 🔄 refrescar estado de productos
  setInterval(() => {
    this.cargarProductos();
  }, 2000);
}

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
cargarProductos() {
  this.server.getOrderProducts(this.order_id).subscribe((res: any) => {
    if (res.error === 0) {

      const nuevosProductos = res.data;

    nuevosProductos.forEach((p: any) => {

  const viejo = this.productos.find(x => x.detail_id == p.detail_id);

  // cocina silenció alerta
  if (viejo && viejo.alert_status == 1 && p.alert_status == 0) {
    this.mostrarToast('👨‍🍳 Cocina recibió el aviso');
    this.sonidoConfirmacion.play();
  }

});

      this.productos = nuevosProductos.map((prod: any) => ({
        ...prod,
        timeDisplay: '00:00'
      }));

      this.actualizarTiempos();
    }
  });
}  
  actualizarTiempos() {
  const now = new Date().getTime();

  this.productos.forEach(p => {
    // 1️⃣ CASO: PRODUCTO TERMINADO (ready)
    // Mostramos el tiempo exacto guardado en la BD (que viene como decimal, ej: 1.52)
    if (p.status === 'ready') {
      const tiempoDecimal = parseFloat(p.preparation_time);

      if (tiempoDecimal > 0) {
        const mins = Math.floor(tiempoDecimal);
        // Multiplicamos la parte decimal por 60 para obtener los segundos reales
        const secs = Math.round((tiempoDecimal - mins) * 60);
        
        // Ajuste por si el redondeo nos da 60 segundos
        const finalMins = secs === 60 ? mins + 1 : mins;
        const finalSecs = secs === 60 ? 0 : secs;

        p.timeDisplay = `${finalMins}:${finalSecs.toString().padStart(2, '0')}`;
      } else {
        p.timeDisplay = '0:00';
      }
      return; // Saltamos al siguiente producto
    }

    // 2️⃣ CASO: PRODUCTO PENDIENTE
    // Calculamos la diferencia entre la hora actual y la hora del pedido
    if (p.order_date) {
      const startTime = new Date(p.order_date.replace(' ', 'T')).getTime();
      const diff = now - startTime;

      if (diff > 0) {
        const totalSecs = Math.floor(diff / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        p.timeDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
      } else {
        p.timeDisplay = '0:00';
      }
    }
  });
}
llamarMesero(prod: any) {
  this.server.triggerAlert(prod.detail_id).subscribe((res: any) => {
    if (res.error === 0) {
      this.mostrarToast(`Alerta enviada`);
      // IMPORTANTE: Recargar la lista para traer el alert_status actualizado
      this.cargarProductos(); 
    }
  });
}
  cerrar() {
    this.modalCtrl.dismiss();
  }

  async mostrarToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2000 });
    t.present();
  }
}