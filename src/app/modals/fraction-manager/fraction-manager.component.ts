import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-fraction-manager',
  templateUrl: './fraction-manager.component.html',
  styleUrls: ['./fraction-manager.component.scss'],
})
export class FractionManagerComponent implements OnInit {

  @Input() ingredient: any;

  fractions: any[] = [];
  locations: any[] = [];

  nuevaFraccion: any = {
    cantidad_total: null,
    cantidad_actual: null,
    descripcion: '',
    location_id: null
  };

  isSaving = false;

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadFractions();
  }

  loadLocations() {
    this.server.getLocations().subscribe((res: any) => {
      this.locations = res.data;
    });
  }

  loadFractions() {
    this.server.getFractions(this.ingredient.id_ingredients)
    .subscribe((res: any) => {
      this.fractions = res.data;
    });
  }

  registrarFraccion() {

    if (!this.nuevaFraccion.cantidad_total) {
      this.showToast("Ingresa cantidad total");
      return;
    }

const data = {
  ingredient_id: this.ingredient.id_ingredients,

  cantidad_total: this.nuevaFraccion.cantidad_total,

  cantidad_actual:
    this.nuevaFraccion.cantidad_actual ||
    this.nuevaFraccion.cantidad_total,

  descripcion: this.nuevaFraccion.descripcion,

  location_id: this.nuevaFraccion.location_id,

  system: this.server.getSystem()
};

    this.server.addFraction(data).subscribe((res: any) => {

      if (res.error === 0) {
        this.showToast("✅ Registrado");
        this.loadFractions();

        this.nuevaFraccion = {
          cantidad_total: null,
          cantidad_actual: null,
          descripcion: '',
          location_id: null
        };
      }

    });

  }

  actualizarCantidad(f: any) {

    const estado = f.cantidad_actual <= 0
      ? 'agotado'
      : 'abierto';

const data = {
  id_fraction: f.id_fraction,
  cantidad_actual: f.cantidad_actual,
  estado,
  system: this.server.getSystem()
};

    this.server.updateFraction(data)
    .subscribe((res: any) => {

      if (res.error === 0) {
        this.showToast("💾 Actualizado");
        this.loadFractions();
      }

    });

  }
eliminarFraccion(f: any) {

  if (!confirm('¿Eliminar?')) return;

  const data = {
    id_fraction: f.id_fraction,
    system: this.server.getSystem()
  };

  this.server.deleteFraction(data)
  .subscribe((res: any) => {

    if (res.error === 0) {
      this.showToast("🗑️ Eliminado");
      this.loadFractions();
    }

  });

}

  async showToast(msg: string) {

    const t = await this.toast.create({
      message: msg,
      duration: 2000
    });

    t.present();

  }

  cerrar() {
    this.modalCtrl.dismiss(true);
  }

}