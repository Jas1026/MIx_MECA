import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private server: ServerContentService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.kitchenId = this.route.snapshot.paramMap.get('id');
    this.loadOrders();
    this.startClock();
  }

  ionViewWillEnter() {
    // Recargar datos del servidor cada 10 segundos
    this.dataInterval = setInterval(() => {
      this.loadOrders();
    }, 10000);
  }

  ngOnDestroy() {
    this.stopIntervals();
  }

  private stopIntervals() {
    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  loadOrders() {
    this.server.getKitchenOrders(this.kitchenId).subscribe((res: any) => {
      if (res.error === 0) {
        // Inicializamos el campo 'timeLeft' para cada producto
        this.orders = res.data.map((item: any) => ({
          ...item,
          timeLeft: '--:--'
        }));

        if (this.orders.length > 0) {
          this.kitchenName = this.orders[0].kitchen_name || 'Estación ' + this.kitchenId;
        }
        this.updateCountdowns();
      }
    });
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

    const sign = isLate ? '-' : '';

    item.timeLeft = `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
    item.isLate = isLate;
  });
}

  // Clase CSS dinámica según si el plato va tarde
  getTimerClass(item: any) {
    return item.isLate ? 'time-badge late' : 'time-badge on-time';
  }

  markReady(detailId: number) {
    this.server.updateDetailStatus(detailId).subscribe((res: any) => {
      this.loadOrders();
    });
  }
}