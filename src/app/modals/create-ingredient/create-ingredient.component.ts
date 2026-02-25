import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-ingredient',
  templateUrl: './create-ingredient.component.html',
  styleUrls: ['./create-ingredient.component.scss'],
})
export class CreateIngredientComponent implements OnInit {

  @Input() ingredient: any;
form: {
  id_ingredients: number | null;
  nombre: string;
  stock_act: number;
  unidad_med: string;
  tipo: string;
  peso_envase: number | null;
  capacidad_total: number | null;
  peso_actual?: number | null; // ← aquí permites null
} = {
  id_ingredients: null,
  nombre: '',
  stock_act: 0,
  unidad_med: '',
  tipo: 'normal',
  peso_envase: null,
  capacidad_total: null,
  peso_actual: 0
};

  unidades = ['kg', 'g', 'l', 'ml', 'unidad']; // Opciones del select

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService
  ) {}

  ngOnInit() {
    if (this.ingredient) {
      this.form = { ...this.ingredient };
    }
  }

  calcularContenido() {
    if (this.form.peso_envase && this.form.peso_actual) {
      this.form.stock_act = this.form.peso_actual - this.form.peso_envase;
    }
  }

  get porcentaje(): number {
    if (!this.form.capacidad_total) return 0;
    return (this.form.stock_act / this.form.capacidad_total) * 100;
  }
  guardar() {
  // Normalizar campos de botella
  if (this.form.tipo === 'botella') {
    // asegúrate que sean números aunque sean 0
    this.form.peso_actual = this.form.peso_actual ?? 0;
    this.form.peso_envase = this.form.peso_envase ?? 0;
    this.form.capacidad_total = this.form.capacidad_total ?? 0;
  } else {
    // para tipo normal no necesitamos estos campos
    this.form.peso_actual = null;
    this.form.peso_envase = null;
    this.form.capacidad_total = null;
  }

  if (this.form.id_ingredients) {
    this.server.updateIngredient(this.form).subscribe(() => {
      this.modalCtrl.dismiss(true);
    }, err => console.log("Error al guardar:", err));
  } else {
    this.server.addIngredient(this.form).subscribe(() => {
      this.modalCtrl.dismiss(true);
    }, err => console.log("Error al guardar:", err));
  }
}
  cerrar() {
    this.modalCtrl.dismiss();
  }
  // Dentro de la clase del componente
getLiquidHeight() {
  if (!this.ingredient.capacidad_total || !this.ingredient.peso_actual) return '0%';
  
  // Cálculo: (actual / total) * 100
  let percentage = (this.ingredient.peso_actual / this.ingredient.capacidad_total) * 100;
  
  // Limitar entre 0 y 100
  percentage = Math.min(Math.max(percentage, 0), 100);
  return percentage + '%';
}
// Dentro de export class CreateIngredientComponent {

calcularPorcentaje(): string {
  // 1. Validamos que existan los valores y no sean cero para evitar errores matemáticos
  const actual = parseFloat(this.ingredient?.peso_actual);
  const total = parseFloat(this.ingredient?.capacidad_total);

  if (!actual || !total || total <= 0) {
    return '0%';
  }

  // 2. Calculamos el porcentaje
  let porcentaje = (actual / total) * 100;

  // 3. Limites: No menos de 0% ni más de 100%
  if (porcentaje > 100) porcentaje = 100;
  if (porcentaje < 0) porcentaje = 0;

  return `${porcentaje.toFixed(0)}%`;
}
}