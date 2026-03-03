import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent implements OnInit {
  @Input() product: any; 

  newProduct: any = {
    nombre_producto: '',
    alias: '',
    price: null,
    time_prep: 0,
    id_category: null
  };

  categories: any[] = [];
  allIngredients: any[] = [];
  allKitchens: any[] = [];
  receta: any[] = []; 
  cocinasSeleccionadas: any[] = []; 

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.getData();
  }

  async getData() {
    const system = this.server.getSystem();
    
    // Carga de catálogos
    this.server.getCategories().subscribe((res: any) => this.categories = res.data || res);
    this.server.getIngredients().subscribe((res: any) => this.allIngredients = res.data || res);
    this.server.getKitchens().subscribe((res: any) => this.allKitchens = res.data || res);

    if (this.product) {
      this.newProduct = { ...this.product };
      this.loadRecipe(this.product.id_product);
      this.loadKitchensAssigned(this.product.id_product);
    } else {
      this.addIngredientRow();
    }
  }

  loadRecipe(id: number) {
    this.server.getProductRecipe(id).subscribe((res: any) => {
      if (res.data) this.receta = res.data;
    });
  }

  loadKitchensAssigned(id: number) {
    this.server.getProductKitchens(id).subscribe((res: any) => {
      if (res.success) {
        this.cocinasSeleccionadas = res.data.map((k: any) => parseInt(k.kitchen_id));
      }
    });
  }

  addIngredientRow() {
    this.receta.push({ id_ingredient: null, cant_us: 0 });
  }

  removeIngredient(index: number) {
    this.receta.splice(index, 1);
  }

  async saveProduct() {
    if (!this.newProduct.nombre_producto || !this.newProduct.price) {
      this.showToast('Nombre y Precio son requeridos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const payload = {
      product: this.newProduct,
      recipe: this.receta.filter(r => r.id_ingredient != null && r.cant_us > 0),
      kitchens: this.cocinasSeleccionadas,
      system: this.server.getSystem()
    };

    this.server.saveFullProduct(payload).subscribe({
      next: (res: any) => {
        loading.dismiss();
        if (res.success) {
          this.showToast('Producto guardado con éxito', 'success');
          this.modalCtrl.dismiss(true);
        } else {
          this.showToast(res.error || 'Error al guardar', 'danger');
        }
      },
      error: () => {
        loading.dismiss();
        this.showToast('Error de conexión', 'danger');
      }
    });
  }

  dismiss() { this.modalCtrl.dismiss(); }

  async showToast(msg: string, col: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: col });
    t.present();
  }
}