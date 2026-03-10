import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';
import { AlertController } from '@ionic/angular';
import { KitchenNotifyService } from 'src/app/services/kitchen-notify.service';
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
  
  // Sonido de alerta
  private audioAlarma = new Audio('assets/sounds/sonidodeprueba.mp3');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private server: ServerContentService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private notify: KitchenNotifyService,
  ) {
    this.audioAlarma.loop = true;
  }
ngOnInit() {
  this.kitchenId = this.route.snapshot.paramMap.get('id');

  // 🔓 Desbloquear audio
  document.body.addEventListener('click', () => {
    this.audioAlarma.play().then(() => {
      this.audioAlarma.pause();
      this.audioAlarma.currentTime = 0;
    }).catch(() => {});
  }, { once: true });

  this.loadOrders(); // 🔥 cargar inmediato

  // 🔥 POLLING REAL
  this.dataInterval = setInterval(() => {
    this.loadOrders();
  }, 1000);

  this.startClock();
}

ngOnDestroy() {
  if (this.dataInterval) clearInterval(this.dataInterval);
  if (this.clockInterval) clearInterval(this.clockInterval);
  this.stopAlarma();
}

  private stopIntervals() {
    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }
loadOrders() {
  this.server.getKitchenOrders(this.kitchenId).subscribe((res: any) => {
    if (res.error === 0) {
      this.orders = res.data.map((item: any) => ({
        ...item,
        
        alert_status: parseInt(item.alert_status)
      }));

      this.checkAlerts();
      this.updateCountdowns();
    }
  });
}
checkAlerts() {
  const hayAlertaActiva = this.orders.some(o => o.alert_status == 1);

  if (hayAlertaActiva) {

    if (this.audioAlarma.paused) {

      this.audioAlarma.currentTime = 0;

      this.audioAlarma.play().then(() => {
        console.log("🔔 Alarma sonando");
      }).catch(err => {
        console.warn("Autoplay bloqueado, esperando interacción...");
      });

    }

  } else {
    this.stopAlarma();
  }
}

  playAlarma() {
    this.audioAlarma.play().catch(err => {
      console.warn("El navegador bloqueó el sonido hasta que hagas clic en la pantalla.");
    });
  }

  stopAlarma() {
    this.audioAlarma.pause();
    this.audioAlarma.currentTime = 0;
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
    this.orders.forEach(item => {
      if (!item.order_date) return;
      const start = new Date(item.order_date.replace(' ', 'T')).getTime();
      const limitMinutes = parseInt(item.time_prep) || 0;
      const targetTime = start + (limitMinutes * 60 * 1000);
      const diffMs = targetTime - now;
      const isLate = diffMs < 0;
      const absMs = Math.abs(diffMs);
      const mins = Math.floor(absMs / 60000);
      const secs = Math.floor((absMs % 60000) / 1000);
      item.timeLeft = `${isLate ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
      item.isLate = isLate;
    });
  }

  getTimerClass(item: any) {
    return item.isLate ? 'time-badge late' : 'time-badge on-time';
  }
async markReady(detailId: number, force: boolean = false) {
  this.server.updateDetailStatus(detailId, 'ready', force).subscribe(async (res: any) => {
if (res.error === 0) {

  const item = this.orders.find(o => o.detail_id == detailId);

  if(item){
    this.notify.pushNotification({
      product: item.name,
      table: item.table_id,
      order: item.order_id
    });
  }

  this.loadOrders();
}else if (res.error === 2) {
      // ERROR 2: Mostrar modal de confirmación
      const alert = await this.alertCtrl.create({
        header: 'Stock Insuficiente',
        message: res.message + '. ¿Deseas continuar y dejar el stock en negativo?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { 
            text: 'Sí, continuar', 
            handler: () => { this.markReady(detailId, true); } // Llamamos de nuevo con force = true
          }
        ]
      });
      await alert.present();
    }
  });
}

  silenciarAlerta(detailId: number) {
    // Llamamos al servicio para poner alert_status = 2
    this.server.silenceAlert(detailId).subscribe((res: any) => {
      this.loadOrders();
    });
  }
  // En cocina.page.ts, añade este método
@HostListener('click')
resumeAudioContext() {
  // Al hacer el primer clic en la pantalla de cocina, 
  // el navegador permitirá que suene la alarma.
  if (this.audioAlarma) {
    this.audioAlarma.play().then(() => {
      this.audioAlarma.pause(); // Lo activamos y pausamos de inmediato
      this.audioAlarma.currentTime = 0;
    }).catch(() => {});
  }
}
}