import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-floating-ready-orders',
  templateUrl: './floating-ready-orders.component.html',
  styleUrls: ['./floating-ready-orders.component.scss']
})
export class FloatingReadyOrdersComponent implements OnInit, OnDestroy {
  expanded = false;
  orders: any[] = [];
  groupedOrders: any[] = [];
  interval: any;
  
  private alertaActiva = false;
  private reproduciendoSonido = false; // Flag crítico para que el setInterval no asfixie el audio

  // Sonidos mapeados de forma segura
  private audioSonido1 = new Audio('assets/sounds/sonidodeprueba.mp3');
  private audioReady = new Audio('assets/sounds/notificacion.mp3');
  
  private previousReadyIds: number[] = [];
  private audioUnlocked = false;

  constructor(private server: ServerContentService) {
    // Inicialización explícita de propiedades de audio estándar de la API de HTML5
    this.audioSonido1.loop = true;
    this.audioSonido1.volume = 1.0;
    this.audioReady.loop = false;
    this.audioReady.volume = 1.0;
  }

  ngOnInit() {
    this.load();
    // Polling cada 2 segundos
    this.interval = setInterval(() => {
      this.load();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.stopSonido1();
  }

  // Desbloqueo nativo interactivo definitivo (Cualquier click en la app lo activa)
  @HostListener('document:click')
  async unlockAudio() {
    if (this.audioUnlocked) return;

    try {
      // Reproducciones cortas para otorgar los permisos de contexto de audio al navegador
      await this.audioSonido1.play();
      this.audioSonido1.pause();
      this.audioSonido1.currentTime = 0;

      await this.audioReady.play();
      this.audioReady.pause();
      this.audioReady.currentTime = 0;

      this.audioUnlocked = true;
      console.log('🔊 [Panel Meseros] Permisos de audio obtenidos con éxito');
      
      // Comprobación inmediata tras desbloquear
      this.checkAlerts();
    } catch (e) {
      console.warn('❌ [Panel Meseros] Audio bloqueado temporalmente por política del navegador', e);
    }
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  load() {
    // CONTROL GLOBAL: Si el usuario es de cocina, no tiene sentido consultar ni hacer sonar este panel
    const role = sessionStorage.getItem('role');
    if (role === 'cocina') {
      if (this.reproduciendoSonido) this.stopSonido1();
      return;
    }

    this.server.getReadyOrders().subscribe({
      next: (res: any) => {
        if (res && res.error == 0 && Array.isArray(res.data)) {
          
          // 1. Filtrar nuevos pedidos listos para entrega inmediata
          const nuevosReady = res.data.filter(
            (x: any) => x.process_status == 'ready_pickup' && !this.previousReadyIds.includes(Number(x.detail_id))
          );

          if (nuevosReady.length > 0 && this.audioUnlocked) {
            this.sonarNuevoReady();
          }

          this.orders = res.data;

          // 2. Mapear IDs para evitar duplicidad de campana corta en el siguiente ciclo
          this.previousReadyIds = res.data
            .filter((x: any) => x.process_status == 'ready_pickup')
            .map((x: any) => Number(x.detail_id));

          // 3. Agrupación limpia para el HTML por order_id
          const grupos: any = {};
          this.orders.forEach((x: any) => {
            if (!grupos[x.order_id]) {
              grupos[x.order_id] = {
                order_id: x.order_id,
                mesa: x.mesa,
                piso: x.piso,
                order_date: x.order_date,
                items: []
              };
            }
            grupos[x.order_id].items.push(x);
          });

          this.groupedOrders = Object.values(grupos);
          
          // 4. Analizar el estado de alertas concurrentes
          this.checkAlerts();
        }
      },
      error: (err) => console.error("Error en HTTP Polling del panel flotante:", err)
    });
  }

  checkAlerts() {
    // Buscamos si existe al menos un producto con estatus de alarma enviado por la cocina (status 1)
    const hayAlerta = this.orders.some(o => Number(o.alert_status) === 1);

    if (hayAlerta) {
      // Si el audio está desbloqueado y NO está sonando actualmente, le damos Play
      if (this.audioUnlocked && !this.reproduciendoSonido) {
        this.reproduciendoSonido = true;
        this.alertaActiva = true;
        
        this.audioSonido1.play()
          .then(() => console.log('🔊 -> ALERTA EMITIENDO SONIDO EN MESERO'))
          .catch(err => {
            console.error('❌ Falló la reproducción directa del Sonido 1:', err);
            this.reproduciendoSonido = false; // Reajuste por si falla el hilo
          });
      }
    } else {
      // Si el servidor ya limpió la alerta, apagamos el reproductor de forma reactiva instantánea
      if (this.reproduciendoSonido || this.alertaActiva) {
        this.stopSonido1();
      }
    }
  }

  stopSonido1() {
    this.alertaActiva = false;
    this.reproduciendoSonido = false;
    this.audioSonido1.pause();
    this.audioSonido1.currentTime = 0;
    console.log('🔇 Sonido de alerta detenido de manera limpia.');
  }

  sonarNuevoReady() {
    // Detiene e inicia la notificación corta para evitar solapamientos raros
    this.audioReady.pause();
    this.audioReady.currentTime = 0;
    this.audioReady.play().catch(err => console.warn("No se pudo reproducir campana corta:", err));
  }

  alertarAlCocina(detailId: any, event: Event) {
    event.stopPropagation();
    this.server.triggerAlert(detailId, 'waiter').subscribe((res: any) => {
      if (res.error == 0) this.load();
    });
  }

  callarAlertaCocina(detailId: any, event: Event) {
    event.stopPropagation();
    this.server.silenceAlert(detailId).subscribe((res: any) => {
      if (res.error == 0) this.load();
    });
  }

  recogerProducto(detail_id: number) {
    this.server.pickProduct_mesero(detail_id).subscribe((res: any) => {
      if (res.error == 0) this.load();
    });
  }

  hasReadyPickup(p: any): boolean {
    return p.items.some((item: any) => item.process_status == 'ready_pickup');
  }
}