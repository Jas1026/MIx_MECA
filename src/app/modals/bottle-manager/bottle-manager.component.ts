import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-bottle-manager',
  templateUrl: './bottle-manager.component.html',
  styleUrls: ['./bottle-manager.component.scss'],
})
export class BottleManagerComponent implements OnInit {
  @Input() ingredient: any; 
  bottles: any[] = [];
  isSaving: boolean = false;
  locations: any[] = [];
  bottlesFiltradas: any[] = [];
filtroLocation: any = null;
  nuevaBotella: any = {
    peso_envase: null,
    capacidad_total: null,
    peso_actual: null,
    cantidad: 1,
      location_id: null 
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toast: ToastController
  ) {}

  ngOnInit() {
      this.loadLocations();
    if (this.ingredient) {
      this.loadBottles();
    }
  }

loadBottles() {
  this.server.getBottles(this.ingredient.id_ingredients).subscribe((res: any) => {
    if (res.error === 0) {
      this.bottles = res.data;
      this.bottlesFiltradas = [...this.bottles]; // 👈 copia inicial
    }
  });
}
filtrarBotellas() {

  if (this.filtroLocation === null) {
    this.bottlesFiltradas = [...this.bottles];
    return;
  }

  this.bottlesFiltradas = this.bottles.filter(b => 
    b.location_id == this.filtroLocation
  );
}
limpiarFiltro() {
  this.filtroLocation = null;
  this.bottlesFiltradas = [...this.bottles];
}
  registrarBotella() {
    // Validar que no falten datos esenciales
    if (!this.nuevaBotella.peso_envase || !this.nuevaBotella.capacidad_total || !this.nuevaBotella.peso_actual) {
      this.showToast("⚠️ Por favor completa todos los campos del pesaje");
      return;
    }

    if (this.isSaving) return;

    const pesoTotal = Number(this.nuevaBotella.peso_actual);
    const pesoEnvase = Number(this.nuevaBotella.peso_envase);
    const capacidad = Number(this.nuevaBotella.capacidad_total);
    const qty = Number(this.nuevaBotella.cantidad) || 1;
    const neto = pesoTotal - pesoEnvase;

    if (pesoTotal <= pesoEnvase) {
      this.showToast("⚠️ El peso total debe ser mayor al envase vacío (" + pesoEnvase + "g)");
      return;
    }

    if (neto > capacidad) {
      this.showToast("⚠️ El contenido (" + neto + "g) no cabe en " + capacidad + "ml");
      return;
    }

    this.isSaving = true;

    const data = {
      ingredient_id: this.ingredient.id_ingredients,
      peso_envase: pesoEnvase,
      capacidad_total: capacidad,
      peso_actual: pesoTotal,
      cantidad: qty,
       location_id: this.nuevaBotella.location_id 
    };

    this.server.addBottle(data).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.error === 0) {
          this.showToast(res.message);
          this.loadBottles();
          this.resetForm(); // LIMPIAR FORMULARIO TRAS ÉXITO
        }
      },
      error: () => {
        this.isSaving = false;
        this.showToast("Error de conexión");
      }
    });
  }

  // FUNCIÓN PARA DEJAR EL FORMULARIO VACÍO
  resetForm() {
    this.nuevaBotella = {
      peso_envase: null,
      capacidad_total: null,
      peso_actual: null,
      cantidad: 1
    };
  }

  actualizarPeso(bottle: any) {
    const pesoActual = Number(bottle.peso_actual);
    const pesoEnvase = Number(bottle.peso_envase);
    const neto = pesoActual - pesoEnvase;
    const nuevoEstado = (neto <= 1) ? 'finalizada' : 'abierta';

    const data = {
      id_bottle: bottle.id_bottle,
      peso_actual: pesoActual,
      estado: nuevoEstado
    };

    this.server.updateBottleWeight(data).subscribe((res: any) => {
      if (res.error === 0) {
        this.showToast(nuevoEstado === 'finalizada' ? "✅ Finalizada" : "💾 Guardado");
        this.loadBottles();
      }
    });
  }

  getPorcentaje(b: any): number {
    const neto = Number(b.peso_actual) - Number(b.peso_envase);
    const capacidad = Number(b.capacidad_total);
    if (neto <= 0) return 0;
    let porc = Math.round((neto / capacidad) * 100);
    return porc > 100 ? 100 : porc;
  }

  getNeto(b: any): number {
    const neto = Number(b.peso_actual) - Number(b.peso_envase);
    return neto > 0 ? neto : 0;
  }

  async showToast(msg: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2000,
      color: 'dark'
    });
    t.present();
  }
loadLocations() {
  this.server.getLocations().subscribe((res: any) => {
    if (res.error === 0) {
      this.locations = res.data;
    }
  });
}



actualizarUbicacion(bottle: any) {

  const data = {
    id_bottle: bottle.id_bottle,
    location_id: bottle.location_id
  };

  this.server.updateBottleLocation(data).subscribe((res: any) => {
    if (res.error === 0) {
      this.showToast("📍 Ubicación actualizada");
    }
  });

}
eliminarBotella(bottle: any) {

  if (!confirm("¿Eliminar este envase?")) return;

  this.server.deleteBottle(bottle.id_bottle).subscribe((res: any) => {
    if (res.error === 0) {
      this.showToast("🗑️ Eliminado");
      this.loadBottles();
    }
  });

}
  cerrar() {
    this.modalCtrl.dismiss(true);
  }
}