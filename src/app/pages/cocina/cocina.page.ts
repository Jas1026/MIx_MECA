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
  private previousOrderIds: number[] = [];
  // Sonido de alerta
  private audioAlarma = new Audio('assets/sounds/alarma.mp3');
private audioNuevoPedido = new Audio('assets/sounds/notificacion.mp3');
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
     this.audioNuevoPedido.loop = false;
  }
ngOnInit() {
  
  this.kitchenId = this.route.snapshot.paramMap.get('id');

  // 🔓 Desbloquear audio
document.body.addEventListener('click', () => {

  // Desbloquear alarma
  this.audioAlarma.play()
    .then(() => {

      this.audioAlarma.pause();

      this.audioAlarma.currentTime = 0;

    })
    .catch(() => {});


  // Desbloquear sonido nuevo pedido
  this.audioNuevoPedido.play()
    .then(() => {

      this.audioNuevoPedido.pause();

      this.audioNuevoPedido.currentTime = 0;

    })
    .catch(() => {});

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

  this.server.getKitchenOrders(this.kitchenId)
    .subscribe((res: any) => {

      if (res.error === 0) {

        const nuevasOrdenes: any[] = res.data.map((item: any) => ({

          ...item,

          alert_status: parseInt(item.alert_status)

        }));


        // Convertimos los IDs antiguos a Set
        const oldIds = new Set<number>(
          this.previousOrderIds
        );


        // Buscamos cuáles son nuevos
        const nuevosPedidos = nuevasOrdenes.filter(
          (o: any) => !oldIds.has(
            Number(o.detail_id)
          )
        );


if (nuevosPedidos.length > 0) {

  nuevosPedidos.forEach((_: any, index: number) => {

    setTimeout(() => {

      this.sonarNuevoPedido();

    }, index * 1200);

  });

}


        // Guardamos IDs actuales
        this.previousOrderIds =
          nuevasOrdenes.map(
            (o: any) => Number(o.detail_id)
          );


        this.orders = nuevasOrdenes;

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

  this.orders.forEach((item:any) => {

    if (!item.order_date) return;

    const start = new Date(
      item.order_date.replace(' ', 'T')
    ).getTime();

    const limitMinutes = parseInt(item.time_prep) || 0;

    // Tiempo transcurrido desde que llegó el pedido
    const elapsedMs = now - start;

    const elapsedMinutes = Math.floor(
      elapsedMs / 60000
    );

    const elapsedSeconds = Math.floor(
      (elapsedMs % 60000) / 1000
    );

    // Mostrar 0:00, 0:01, 0:02...
    item.timeLeft =
      `${elapsedMinutes}:${elapsedSeconds
        .toString()
        .padStart(2, '0')}`;

    // Pasó el tiempo estimado?
    item.isLate =
      elapsedMinutes >= limitMinutes;

  });

}

  getTimerClass(item: any) {
    return item.isLate ? 'time-badge late' : 'time-badge on-time';
  }

// markReady(detailId: number) {
//   // Ya no pasamos 'force' porque el stock se validó al crear el pedido
//   this.server.updateDetailStatus(detailId, 'ready').subscribe((res: any) => {
//     if (res.error === 0) {
//       const item = this.orders.find(o => o.detail_id == detailId);

//       if (item) {
//         this.notify.pushNotification({
//           product: item.name,
//           table: item.table_id,
//           order: item.order_id
//         });
//       }

//       this.loadOrders(); // Refrescar la lista de cocina
//     } else {
//       // Solo errores genéricos de conexión o base de datos
//       alert("Error al actualizar: " + res.message);
//     }
//   });
// }

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
sonarNuevoPedido() {

  this.audioNuevoPedido.pause();

  this.audioNuevoPedido.currentTime = 0;

  this.audioNuevoPedido.play()
    .then(() => {

      console.log("🛎️ Nuevo pedido");

    })
    .catch(err => {

      console.warn("No se pudo reproducir:", err);

    });

}
startPreparing(item:any){

this.server

.updateProcessStatus(

item.detail_id,

'preparing'

)

.subscribe(()=>{

item.process_status='preparing';

});

}
readyPickup(item:any){

this.server

.updateProcessStatus(

item.detail_id,

'ready_pickup'

)

.subscribe(()=>{

item.process_status='ready_pickup';

});

}
countProducts(orderId:number){

return this.orders.filter(

x=>x.order_id==orderId

).length;

}
}