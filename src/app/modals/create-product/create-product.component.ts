import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent implements OnInit {
  @Input() product: any; // Datos del producto si es edición

  // Objeto principal
  newProduct: any = {
    nombre_producto: '',
    price: null,
    time_prep: 0,
    id_category: null
  };

  // Listas para los selects
  categories: any[] = [];
  allIngredients: any[] = [];
  allKitchens: any[] = [];
  
  // Tablas relacionales
  receta: any[] = []; // Array de objetos { id_ingredient, cant_us }
  cocinasSeleccionadas: any[] = []; // Array de IDs de cocina

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.getData();
  }

  async getData() {
    // Carga de catálogos iniciales
    this.server.getCategories().subscribe((res: any) => {
      this.categories = res.data || res;
    });

    this.server.getIngredients().subscribe((res: any) => {
      this.allIngredients = res.data || res;
    });

    this.server.getKitchens().subscribe((res: any) => {
      this.allKitchens = res.data || res;
    });

    // Si es edición, cargamos los datos existentes
    if (this.product) {
      this.newProduct = { ...this.product };
      this.loadRecipe(this.product.id_product);
      this.loadKitchensAssigned(this.product.id_product);
    } else {
      // Si es nuevo, añadimos una fila de ingrediente vacía por defecto
      this.addIngredientRow();
    }
  }

  loadRecipe(id: number) {
    this.server.getProductRecipe(id).subscribe((res: any) => {
      if (res.data) this.receta = res.data;
    });
  }

  loadKitchensAssigned(id: number) {
    // Asumiendo que tienes este método o similar en el service
    this.server.getProductKitchens(id).subscribe((res: any) => {
      if (res.success) {
        this.cocinasSeleccionadas = res.data.map((k: any) => parseInt(k.kitchen_id));
      }
    });
  }

  // --- MESTIÓN DE FILAS DE RECETA ---
  addIngredientRow() {
    this.receta.push({ 
      id_ingredient: null, 
      cant_us: 0 
    });
  }

  removeIngredient(index: number) {
    this.receta.splice(index, 1);
  }

  // --- PERSISTENCIA ---
  async saveProduct() {
    // Validaciones
    if (!this.newProduct.nombre_producto || !this.newProduct.price) {
      this.showToast('Nombre y Precio son requeridos', 'warning');
      return;
    }

    if (this.cocinasSeleccionadas.length === 0) {
      this.showToast('Selecciona al menos una cocina', 'warning');
      return;
    }

    const payload = {
      product: this.newProduct,
      recipe: this.receta.filter(r => r.id_ingredient != null && r.cant_us > 0),
      kitchens: this.cocinasSeleccionadas,
      system: this.server.getSystem()
    };

    this.server.saveFullProduct(payload).subscribe((res: any) => {
      if (res.success || res.error === 0) {
        this.showToast('Guardado correctamente en ' + payload.system, 'success');
        this.modalCtrl.dismiss(true);
      } else {
        this.showToast('Error al guardar', 'danger');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async showToast(msg: string, col: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: col });
    t.present();
  }
}