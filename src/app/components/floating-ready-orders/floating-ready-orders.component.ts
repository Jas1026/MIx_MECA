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
  private reproduciendoSonido = false; 

  // --- MAPEO DE AUDIO ---
  // Sonido 1: Alerta continua cuando cocina molesta al mesero (Zumbido/Alarma)
  private audioSonido1 = new Audio('assets/sounds/sonido_notificacion3.mp3');
  
  // NUEVO SONIDO: Campana corta exclusiva para cuando un producto pasa a estar "Listo para recoger"
  private audioNuevoReady = new Audio('assets/sounds/notificacion.mp3'); 
  
  // Notificación opcional por si la usas en otra parte (se mantiene por compatibilidad)
  private audioReady = new Audio('assets/sounds/notificacion.mp3');
  
  private previousReadyIds: number[] = [];
  private audioUnlocked = false;

  constructor(private server: ServerContentService) {
    this.audioSonido1.loop = true;
    this.audioSonido1.volume = 1.0;
    
    this.audioNuevoReady.loop = false;
    this.audioNuevoReady.volume = 1.0;

    this.audioReady.loop = false;
    this.audioReady.volume = 1.0;
  }

  ngOnInit() {
    this.load();
    this.interval = setInterval(() => {
      this.load();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    this.stopSonido1();
  }

  // Desbloqueo nativo interactivo (Agregado el nuevo sonido al combo de inicialización)
  @HostListener('document:click')
  async unlockAudio() {
    if (this.audioUnlocked) return;

    try {
      // Calentamos los tres audios simultáneamente con un micro-play
      await this.audioSonido1.play();
      this.audioSonido1.pause();
      this.audioSonido1.currentTime = 0;

      await this.audioNuevoReady.play();
      this.audioNuevoReady.pause();
      this.audioNuevoReady.currentTime = 0;

      await this.audioReady.play();
      this.audioReady.pause();
      this.audioReady.currentTime = 0;

      this.audioUnlocked = true;
      console.log('🔊 [Panel Meseros] Todos los hilos de audio desbloqueados');
      
      this.checkAlerts();
    } catch (e) {
      console.warn('❌ [Panel Meseros] Permiso de audio denegado temporalmente', e);
    }
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  load() {
    const role = sessionStorage.getItem('role');
    if (role === 'cocina') {
      if (this.reproduciendoSonido) this.stopSonido1();
      return;
    }

    this.server.getReadyOrders().subscribe({
      next: (res: any) => {
        if (res && res.error == 0 && Array.isArray(res.data)) {
          
          // DETECTOR CRÍTICO: Filtra productos que acaban de cambiar a 'ready_pickup' y no estaban guardados en el ciclo anterior
          const nuevosReady = res.data.filter(
            (x: any) => x.process_status == 'ready_pickup' && !this.previousReadyIds.includes(Number(x.detail_id))
          );

          // Si detecta un cambio de estado a listo, dispara el nuevo sonido condicionado al desbloqueo
          if (nuevosReady.length > 0 && this.audioUnlocked) {
            this.sonarCampanaDespacho();
          }

          this.orders = res.data;

          // Guardamos el estado actual de IDs listos para que en 2 segundos no vuelva a sonar el mismo pedido
          this.previousReadyIds = res.data
            .filter((x: any) => x.process_status == 'ready_pickup')
            .map((x: any) => Number(x.detail_id));

          // Agrupación para la vista de tarjetas
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
          this.checkAlerts();
        }
      },
      error: (err) => console.error("Error Polling:", err)
    });
  }

  checkAlerts() {
    const hayAlerta = this.orders.some(o => Number(o.alert_status) === 1);

    if (hayAlerta) {
      if (this.audioUnlocked && !this.reproduciendoSonido) {
        this.reproduciendoSonido = true;
        this.alertaActiva = true;
        
        this.audioSonido1.play()
          .then(() => console.log('🔊 -> Alerta persistente sonando...'))
          .catch(err => {
            console.error('❌ Error Sonido 1:', err);
            this.reproduciendoSonido = false;
          });
      }
    } else {
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
  }

  // EJECUCIÓN DEL NUEVO SONIDO INDEPENDIENTE
  sonarCampanaDespacho() {
    this.audioNuevoReady.pause();
    this.audioNuevoReady.currentTime = 0;
    this.audioNuevoReady.play()
      .then(() => console.log('🔔 -> ¡Pedido nuevo listo para recoger! Sonando campana.'))
      .catch(err => console.warn("No se pudo reproducir la campana de despacho:", err));
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