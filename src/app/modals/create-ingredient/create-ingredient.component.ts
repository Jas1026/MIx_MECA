import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-ingredient',
  templateUrl: './create-ingredient.component.html',
  styleUrls: ['./create-ingredient.component.scss'],
})
export class CreateIngredientComponent implements OnInit {

  @Input() ingredient: any;
  isSaving: boolean = false;
locations: any[] = [];
providers: any[] = [];
  form: any = {
    id_ingredients: null,
    nombre: '',
    stock_act: 0,
    unidad_med: '',
    tipo: 'normal',
    location_id: null ,
    provider_id: null
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.loadLocations();
      this.loadProviders();
  }
  loadLocations() {
  this.server.getLocations().subscribe((res: any) => {
    this.locations = res.data;

    // 👇 AQUÍ VA
    if (this.ingredient) {
     this.form = {
  ...this.ingredient,

  location_id: this.ingredient.location_id
    ? +this.ingredient.location_id
    : null,

provider_id: this.ingredient.proveedor_id
    ? +this.ingredient.provider_id
    : null
};

      if (this.form.tipo === 'botella') {
        this.form.unidad_med = 'g';
      }
    }
  });
}
onTipoChange() {

  // BOTELLAS
  if (this.form.tipo === 'botella') {

    this.form.unidad_med = 'g';
    this.form.stock_act = 0;

  }

  // FRACCIONADOS
  else if (this.form.tipo === 'fraccionado') {

    this.form.unidad_med = 'porcion';
    this.form.stock_act = 0;

  }

}

  async guardar() {
    // Validaciones básicas
    if (!this.form.nombre) {
      this.presentToast("Por favor, ingresa un nombre.");
      return;
    }

    if (!this.form.unidad_med) {
      this.presentToast("Selecciona una unidad de medida.");
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    // Aseguramos consistencia antes de enviar
// Consistencia automática
if (this.form.tipo === 'botella') {

  this.form.unidad_med = 'g';
  this.form.stock_act = 0;

}

if (this.form.tipo === 'fraccionado') {

  this.form.unidad_med = 'porcion';
  this.form.stock_act = 0;

}

    const payload = {
      ...this.form,
      system: this.server.getSystem()
    };

    if (this.form.id_ingredients) {
      // EDITAR
      this.server.updateIngredient(payload).subscribe({
        next: () => this.modalCtrl.dismiss(true),
        error: () => {
          this.isSaving = false;
          this.presentToast("Error al actualizar el insumo.");
        }
      });
    } else {
      // CREAR NUEVO
      this.server.addIngredient(payload).subscribe({
        next: () => this.modalCtrl.dismiss(true),
        error: () => {
          this.isSaving = false;
          this.presentToast("Error al crear el insumo.");
        }
      });
    }
  }

  async presentToast(msg: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    t.present();
  }
  loadProviders() {
  this.server.getProveedor(this.server.getSystem())
  .subscribe((res: any) => {

    this.providers = res;

  });
}
  cerrar() {
    this.modalCtrl.dismiss();
  }
}