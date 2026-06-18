import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';
import { AlertController, ModalController } from '@ionic/angular';
import { KitchenNotifyService } from 'src/app/services/kitchen-notify.service';
import { IngredientAdjustModalComponent } from '../../ingredient-adjust-modal/ingredient-adjust-modal.component';

@Component({
  selector: 'app-cocina',
  templateUrl: './cocina.page.html',
  styleUrls: ['./cocina.page.scss'],
})
export class CocinaPage implements OnInit, OnDestroy {
  kitchenId: any;
  kitchenName: string = '';
  orders: any[] = [];
  private dataInterval: any;
  private clockInterval: any;
  private previousOrderIds: number[] = [];

  // Sonidos de Cocina
  private audioNuevoPedido = new Audio('assets/sounds/notificacion.mp3');
  // Sonido 2: Alerta que recibe cocina cuando el mesero la molesta
  private audioSonido2 = new Audio('assets/sounds/sonidodeprueba.mp3');
private audioUnlocked = false;
private isPlayingNuevo = false;
private isPlayingAlerta = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private server: ServerContentService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private notify: KitchenNotifyService,
    private modalCtrl: ModalController,
  ) {
    this.audioNuevoPedido.loop = false;
    this.audioSonido2.loop = true;
  }

  ngOnInit() {
    this.kitchenId = this.route.snapshot.paramMap.get('id');

    this.loadOrders(); 

    // Polling de peticiones
    this.dataInterval = setInterval(() => {
      this.loadOrders();
    }, 1000);

    this.startClock();
  }

  ngOnDestroy() {
    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.stopSonido2();
  }
@HostListener('document:click')
unlockAudio() {
  if (this.audioUnlocked) return;

  const unlock = async () => {
    try {
      // “calentamos” los audios sin bloquearlos
      await this.audioNuevoPedido.play();
      this.audioNuevoPedido.pause();
      this.audioNuevoPedido.currentTime = 0;

      await this.audioSonido2.play();
      this.audioSonido2.pause();
      this.audioSonido2.currentTime = 0;

      this.audioUnlocked = true;

      console.log("🔊 Audio desbloqueado correctamente");
    } catch (e) {
      console.warn("Audio aún bloqueado:", e);
    }
  };

  unlock();
}
  @HostListener('click')
  resumeAudioContext() {
    if (this.audioSonido2) {
      this.audioSonido2.play().then(() => {
        this.audioSonido2.pause();
        this.audioSonido2.currentTime = 0;
      }).catch(() => {});
    }
    if (this.audioNuevoPedido) {
      this.audioNuevoPedido.play().then(() => {
        this.audioNuevoPedido.pause();
        this.audioNuevoPedido.currentTime = 0;
      }).catch(() => {});
    }
  }

  loadOrders() {
    this.server.getKitchenOrders(this.kitchenId).subscribe((res: any) => {
      if (res.error === 0) {
        const nuevasOrdenes: any[] = res.data.map((item: any) => ({
          ...item,
          alert_status: parseInt(item.alert_status)
        }));

        const oldIds = new Set<number>(this.previousOrderIds);
        const nuevosPedidos = nuevasOrdenes.filter((o: any) => !oldIds.has(Number(o.detail_id)));

        if (nuevosPedidos.length > 0) {
          nuevosPedidos.forEach((_: any, index: number) => {
            setTimeout(() => { this.sonarNuevoPedido(); }, index * 1200);
          });
        }

        this.previousOrderIds = nuevasOrdenes.map((o: any) => Number(o.detail_id));
        this.orders = nuevasOrdenes;
        
        this.checkAlerts();
        this.updateCountdowns();
      }
    });
  }
  
checkAlerts() {
  const hayAlerta = this.orders.some(o => o.alert_status === 3);

  if (!this.audioUnlocked) return;

  if (hayAlerta) {
    if (this.audioSonido2.paused) {
      this.audioSonido2.play().catch(err =>
        console.warn("Autoplay bloqueado:", err)
      );
    }
  } else {
    this.stopSonido2();
  }
}

stopSonido2() {
  this.audioSonido2.pause();
  this.audioSonido2.currentTime = 0;
}

  // Cocina molesta al mesero (Envía alerta con status 1)
  alertarAlMesero(detailId: number) {
    this.server.triggerAlert(detailId, 'kitchen').subscribe((res: any) => {
      if (res.error === 0) this.loadOrders();
    });
  }

  // Cocina apaga la alerta que le mandó el mesero (Apaga el status 3)
  callarAlertaMesero(detailId: number) {
    this.server.silenceAlert(detailId).subscribe((res: any) => {
      if (res.error === 0) this.loadOrders();
    });
  }

  sonarNuevoPedido() {
    this.audioNuevoPedido.pause();
    this.audioNuevoPedido.currentTime = 0;
    this.audioNuevoPedido.play().catch(err => console.warn("No se pudo reproducir:", err));
  }

  startClock() {
    this.clockInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.updateCountdowns();
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  private updateCountdowns() {
    const now = new Date().getTime();
    this.orders.forEach((item: any) => {
      if (!item.order_date) return;
      const start = new Date(item.order_date.replace(' ', 'T')).getTime();
      const limitMinutes = parseInt(item.time_prep) || 0;
      const elapsedMs = now - start;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

      item.timeLeft = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
      item.isLate = elapsedMinutes >= limitMinutes;
    });
  }

  getTimerClass(item: any) {
    return item.isLate ? 'time-badge late' : 'time-badge on-time';
  }

  async openIngredientAdjust(item: any) {
    const modal = await this.modalCtrl.create({
      component: IngredientAdjustModalComponent,
      componentProps: { detailId: item.detail_id }
    });
    await modal.present();
  }

  startPreparing(item: any) {
    this.server.updateProcessStatus(item.detail_id, 'preparing').subscribe(() => {
      item.process_status = 'preparing';
    });
  }

  readyPickup(item: any) {
    this.server.updateProcessStatus(item.detail_id, 'ready_pickup').subscribe(() => {
      item.process_status = 'ready_pickup';
    });
  }

  countProducts(orderId: number) {
    return this.orders.filter(x => x.order_id == orderId).length;
  }
}