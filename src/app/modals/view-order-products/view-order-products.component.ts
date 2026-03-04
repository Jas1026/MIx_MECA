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

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.cargarProductos();
    // Actualizamos el cronómetro cada segundo
    this.timer = setInterval(() => {
      this.actualizarTiempos();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  cargarProductos() {
    this.server.getOrderProducts(this.order_id).subscribe((res: any) => {
      if (res.error === 0) {
        this.productos = res.data.map((prod: any) => ({
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
    // 1️⃣ Si el producto ya está TERMINADO (ready), no actualizamos más el tiempo
    // Se quedará con el último valor que calculó antes de ser marcado.
    if (p.status === 'ready') {
      return; 
    }

    // 2️⃣ Si sigue pendiente, calculamos el tiempo transcurrido
    const startTime = new Date(p.order_date.replace(' ', 'T')).getTime();
    const diff = now - startTime;
    
    if (diff > 0) {
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      p.timeDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
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