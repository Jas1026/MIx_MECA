import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';
import { AlertController } from '@ionic/angular';
import { KitchenNotifyService } from 'src/app/services/kitchen-notify.service';
import { ModalController } from '@ionic/angular';
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
  
  // Sonido de alerta
  private audioAlarma = new Audio('assets/sounds/alarma.mp3');

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
ingredients:any[] = [];
adjustList:any[] = [];
selectedIngredient:any = null;
adjustQty:number = 0;
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

markReady(detailId: number) {
  // Ya no pasamos 'force' porque el stock se validó al crear el pedido
  this.server.updateDetailStatus(detailId, 'ready').subscribe((res: any) => {
    if (res.error === 0) {
      const item = this.orders.find(o => o.detail_id == detailId);

      if (item) {
        this.notify.pushNotification({
          product: item.name,
          table: item.table_id,
          order: item.order_id
        });
      }

      this.loadOrders(); // Refrescar la lista de cocina
    } else {
      // Solo errores genéricos de conexión o base de datos
      alert("Error al actualizar: " + res.message);
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
async openIngredientAdjust(item:any){

  const modal = await this.modalCtrl.create({
    component: IngredientAdjustModalComponent,
    componentProps:{
      detailId:item.detail_id
    }
  });

  await modal.present();

}


initIngredientEvents(){

  const addBtn:any = document.getElementById("addIngredientBtn");

  addBtn.onclick = ()=>{

    const select:any = document.getElementById("ingredientSelect");
    const qty:any = document.getElementById("qtyInput");

    const ingId = Number(select.value);
    const cantidad = Number(qty.value);

    if(!ingId || !cantidad) return;

    const ing = this.ingredients.find(i=>i.id_ingredients==ingId);

    const ajuste = {
      ingredient_id: ingId,
      qty: cantidad
    };

    this.adjustList.push(ajuste);

    const list:any = document.getElementById("ingredientList");

    list.innerHTML += `
      <div style="display:flex;justify-content:space-between;margin-top:5px">
        <span>${ing.nombre}</span>
        <b>${cantidad > 0 ? '+' : ''}${cantidad} ${ing.unidad_med}</b>
      </div>
    `;

    qty.value="";

  };

}

}