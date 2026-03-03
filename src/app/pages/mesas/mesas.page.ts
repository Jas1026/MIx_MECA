import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';
import { ResumenPedidoComponent } from '../../components/resumen-pedido/resumen-pedido.component';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.page.html',
  styleUrls: ['./mesas.page.scss'],
})
export class MesasPage implements OnInit, OnDestroy {
  tables: any[] = [];
  flatId: string = '';
  private dataInterval: any;
  private clockInterval: any;

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
  this.route.paramMap.subscribe(params => {
    this.flatId = params.get('id') || '';
    this.loadTables();
  });

  // 👇 INICIAMOS EL RELOJ AQUÍ
  this.startClock();
}

  ionViewWillEnter() {
    this.loadTables();

    // Recargar datos del servidor cada 15 segundos
    this.dataInterval = setInterval(() => this.loadTables(), 15000);
  }

  ionViewWillLeave() {
    this.stopIntervals();
  }

  ngOnDestroy() {
    this.stopIntervals();
  }

  private stopIntervals() {
    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  loadTables() {
    this.server.getTables(this.flatId).subscribe((res: any) => {
      if (res.error === 0) {
        // Al recibir las mesas, inicializamos el campo 'timeDisplay'
        this.tables = res.data.map((m: any) => ({
          ...m,
          timeDisplay: '0.00'
        }));
        this.updateAllClocks();
      }
    });
  }

startClock() {
  if (this.clockInterval) {
    clearInterval(this.clockInterval);
  }

  this.clockInterval = setInterval(() => {
    console.log('⏱ tick'); // 👈 verifica en la consola que corre cada segundo

    this.ngZone.run(() => {
      this.updateAllClocks();
    });

  }, 1000);
}
  private updateAllClocks() {
    const now = new Date().getTime();

    this.tables = this.tables.map(mesa => {
      if (mesa.order_date && mesa.estado !== 'Libre') {
        const dateStr = mesa.order_date.replace(' ', 'T');
        const startTime = new Date(dateStr).getTime();
        const diffMs = now - startTime;

        if (diffMs > 0) {
          const totalSeconds = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;

          
          return {
            ...mesa,
            timeDisplay: `${mins}.${secs.toString().padStart(2, '0')}`
          };
        }
      }

      return mesa;
    });
  }
  getTimerClass(mesa: any): string {
    const transcurrido = parseFloat(mesa.timeDisplay || '0');
    const estimado = parseInt(mesa.estimated_time) || 0;
    return (estimado > 0 && transcurrido >= estimado) ? 'timer-text delayed' : 'timer-text normal';
  }

  // --- Funciones de Modales (Mantenlas igual) ---
  async openOrderModal(table: any) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const modal = await this.modalCtrl.create({
      component: OrderModalComponent,
      componentProps: { table: table, userId: userData.id_user || userData.id }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.loadTables();
  }

  async abrirResumen(orderId: number) {
    const modal = await this.modalCtrl.create({
      component: ResumenPedidoComponent, componentProps: { orderId }
    });
    await modal.present();
  }
}