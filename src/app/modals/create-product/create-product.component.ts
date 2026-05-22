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
locations: any[] = [];
stocks: any[] = [];
providers: any[] = [];

newProduct: any = {
  nombre_producto: '',
  alias: '',
  price: null,
  time_prep: 0,
  id_category: null,
  stock_congelado: 0,
  stock_disponible: 0,
  stock_minimo: 1,
  location_id: null,
  proveedor_id: null,
  tipo_producto: 'elaborado'
};

  categories: any[] = [];
  allIngredients: any[] = [];
  allKitchens: any[] = [];
  receta: any[] = []; 
  subcategories: any[] = [];
  cocinasSeleccionadas: any[] = []; 

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

ngOnInit() {
  this.getData();

  if (this.product) {
    console.log("PRODUCT ORIGINAL:", this.product);
    this.newProduct = {
  ...JSON.parse(JSON.stringify(this.product)),

  // 🔥 si no existe tipo => elaborado
  tipo_producto:
    this.product.tipo_producto || 'elaborado'
};

    // 🔥 CARGAR SUBCATEGORÍAS AQUÍ (NO en locations)
    if (this.product.id_category) {
      this.server.getSubcategories(this.product.id_category)
        .subscribe((res: any) => {
          this.subcategories = res.data || [];
        });
    }

    this.loadRecipe(this.product.id_product);
    this.loadKitchensAssigned(this.product.id_product);
    this.loadLocationsStock(this.product.id_product);
  }
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
this.server.getProveedor(this.server.getSystem())
.subscribe((res: any) => {

  this.providers = res;

});
        // 2. Solo cuando TODO lo anterior existe, cargamos el producto
if (this.product) {
console.log("PRODUCT ORIGINAL:", this.product);
  this.newProduct = {
    ...JSON.parse(JSON.stringify(this.product)),

    tipo_producto:
      this.product.tipo_producto || 'elaborado'
  };

  console.log("PRODUCTO EDITANDO:", this.newProduct);

  this.loadRecipe(this.product.id_product);
  this.loadKitchensAssigned(this.product.id_product);

}
        
        else {
          this.addIngredientRow();
        }

        loading.dismiss();
      });
    });
  });
  this.server.getLocations().subscribe((res: any) => {
  if (res.error === 0) {
    this.locations = res.data;
  }
  if (this.product?.id_category) {
  this.server.getSubcategories(this.product.id_category)
    .subscribe((res: any) => {
      this.subcategories = res.data || [];
    });
}
});
}

onCategoryChange() {
  if (!this.newProduct.id_category) return;

  this.server.getSubcategories(this.newProduct.id_category)
    .subscribe((res: any) => {
      this.subcategories = res.data || [];
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
  // 1. Validación de campos básicos
  if (!this.newProduct.nombre_producto || !this.newProduct.price) {
    this.showToast('Nombre y Precio son requeridos', 'warning');
    return;
  }

  // 3. Limpieza de Receta
  const recetaLimpia = this.receta
    .filter(item => item.id_ingredient && parseFloat(item.cant_us) > 0)
    .map(item => ({
      id_ingredient: Number(item.id_ingredient),
      cant_us: parseFloat(item.cant_us)
    }));

  // --- 4. Formateo de TODOS los campos numéricos (incluyendo Stock Mínimo) ---
  this.newProduct.stock_congelado = parseFloat(this.newProduct.stock_congelado) || 0;
  this.newProduct.stock_disponible = parseFloat(this.newProduct.stock_disponible) || 0;
  this.newProduct.stock_minimo = parseFloat(this.newProduct.stock_minimo) || 0; // 🔥 Agregado
  this.newProduct.time_prep = parseInt(this.newProduct.time_prep) || 0;
  this.newProduct.price = parseFloat(this.newProduct.price) || 0;


  const totalDisponible = this.stocks.reduce((sum, s) => sum + Number(s.stock_disponible || 0), 0);
const totalCongelado = this.stocks.reduce((sum, s) => sum + Number(s.stock_congelado || 0), 0);

if (totalDisponible > this.newProduct.stock_disponible) {
  this.showToast('El stock distribuido disponible supera el total', 'danger');
  return;
}

if (totalCongelado > this.newProduct.stock_congelado) {
  this.showToast('El stock congelado distribuido supera el total', 'danger');
  return;
}
  // --- 5. Envío al servidor ---
  const loading = await this.loadingCtrl.create({ message: 'Guardando producto...' });
  await loading.present();

// 🔥 Si eligieron ubicación principal y no existe en stocks
if (this.newProduct.location_id) {

  const existe = this.stocks.find(
    s => Number(s.location_id) === Number(this.newProduct.location_id)
  );

  if (!existe) {

    this.stocks.push({
      location_id: Number(this.newProduct.location_id),

      stock_disponible:
        Number(this.newProduct.stock_disponible || 0),

      stock_congelado:
        Number(this.newProduct.stock_congelado || 0),

      stock_minimo:
        Number(this.newProduct.stock_minimo || 1)
    });

  }
}
const payload = {
  product: this.newProduct,
  recipe: recetaLimpia,
  kitchens: this.cocinasSeleccionadas,
  stocks: this.stocks,
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
    error: (err) => {
      loading.dismiss();
      console.error('Error:', err);
      this.showToast('Error de conexión', 'danger');
    }
  });
}
loadKitchensAssigned(id: number) {
  // Asegúrate de pasar el sistema en la petición si tu servicio lo requiere
  this.server.getProductKitchens(id).subscribe((res: any) => {
    if (res.success && res.data) {
      // Forzamos que cada ID sea un número real
      this.cocinasSeleccionadas = res.data.map((k: any) => Number(k.kitchen_id));
      console.log("Cocinas asignadas cargadas (IDs):", this.cocinasSeleccionadas);
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

getIngredientUnit(id_ingredient: any): string {
  if (!id_ingredient || !this.allIngredients) return '';
  
  // Buscamos el ingrediente en la lista completa
  const ing = this.allIngredients.find(i => Number(i.id_ingredients) === Number(id_ingredient));
  
  // Devolvemos la unidad o un guion si no lo encuentra
  return ing ? ing.unidad_med : '';
}
addStock() {
  this.stocks.push({
    location_id: null,
    stock_disponible: 0,
    stock_congelado: 0,
    stock_minimo: 1 // 🔥 aquí también
  });
}

removeStock(i: number) {
  this.stocks.splice(i, 1);
}
loadLocationsStock(id: number) {
  this.server.getProductLocations(id, this.server.getSystem()).subscribe((res: any) => {
    if (res.success) {
      this.stocks = res.data.map((s: any) => ({
        location_id: Number(s.location_id),
        stock_disponible: Number(s.stock_disponible),
        stock_congelado: Number(s.stock_congelado),
        stock_minimo: Number(s.stock_minimo || 1)
      }));
    }
  });
}
onTipoProductoChange() {

  if (this.newProduct.tipo_producto === 'final') {

    this.newProduct.alias = null;

    this.newProduct.id_category = null;

    this.newProduct.id_subcategory = null;

    this.newProduct.time_prep = 0;

    this.newProduct.stock_congelado = 0;

    this.receta = [];

    this.cocinasSeleccionadas = [];

  }

}
onIngredientBaseSelected(ev: any) {

  const ing = ev.detail.value;

  if (!ing) return;

  // 🔥 rellenar automáticamente
  this.newProduct.nombre_producto = ing.nombre || '';

  this.newProduct.stock_disponible =
    Number(ing.stock_act || 0);

  this.newProduct.proveedor_id =
    ing.proveedor_id
      ? Number(ing.proveedor_id)
      : null;

  this.newProduct.location_id =
    ing.location_id
      ? Number(ing.location_id)
      : null;

  // opcional
  this.newProduct.stock_minimo = 1;

}
}