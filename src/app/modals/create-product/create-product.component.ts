import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent implements OnInit {
  public Number = Number;

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
    console.log("producto recibido", this.product);
  }
  async getData() {
  const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
  await loading.present();

  // 1. Cargamos Catálogos Base
  this.server.getIngredients().subscribe((resIng: any) => {
    this.allIngredients = resIng.data || resIng;
this.server.getKitchens().subscribe((resKit: any) => {

  const kitchens = resKit.data || resKit;

  this.allKitchens = kitchens.map((k:any)=>({
    ...k,
    id: Number(k.id)   // 🔥 FORZAMOS number
  }));
console.log("todas cocinas", this.allKitchens);
      this.server.getCategories().subscribe((resCat: any) => {
        this.categories = resCat.data || resCat;

        // 2. Solo cuando TODO lo anterior existe, cargamos el producto
        if (this.product) {
          // Clonamos para no afectar la lista principal
          this.newProduct = JSON.parse(JSON.stringify(this.product)); 
          this.loadRecipe(this.product.id_product);
          this.loadKitchensAssigned(this.product.id_product);
        } else {
          this.addIngredientRow();
        }
        loading.dismiss();
      });
    });
  });
}

loadRecipe(id: number) {
  this.server.getProductRecipe(id).subscribe((res: any) => {
    if (res.error === 0 && res.data) {
      // 🚨 CRÍTICO: Convertimos id_ingredient a Number para que el select lo reconozca
      this.receta = res.data.map((item: any) => ({
        id_ingredient: Number(item.id_ingredient),
        cant_us: parseFloat(item.cant_us)
      }));
    }
  });
}
async saveProduct() {
    if (!this.newProduct.nombre_producto || !this.newProduct.price) {
      this.showToast('Nombre y Precio son requeridos', 'warning');
      return;
    }

    // 2. Limpieza profunda antes de enviar al PHP
    const recetaLimpia = this.receta
      .filter(item => item.id_ingredient && parseFloat(item.cant_us) > 0)
      .map(item => ({
        id_ingredient: Number(item.id_ingredient),
        cant_us: parseFloat(item.cant_us)
      }));

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const payload = {
      product: this.newProduct,
      recipe: recetaLimpia,
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
  
  loadKitchensAssigned(id: number) {
  this.server.getProductKitchens(id).subscribe((res: any) => {

    if (res.success) {

      this.cocinasSeleccionadas = res.data.map((k: any) =>
        Number(k.kitchen_id)
      );

      console.log("cocinas cargadas", this.cocinasSeleccionadas);

    }

  });
}

  addIngredientRow() {
    this.receta.push({ id_ingredient: null, cant_us: 0 });
  }

  removeIngredient(index: number) {
    this.receta.splice(index, 1);
  }


  dismiss() { this.modalCtrl.dismiss(); }

  async showToast(msg: string, col: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: col });
    t.present();
  }
}