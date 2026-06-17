import { Component } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import {
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular';
import { CreateIngredientComponent } from 'src/app/modals/create-ingredient/create-ingredient.component';
import { CreateProductComponent } from 'src/app/modals/create-product/create-product.component';
import { ViewProductDetailComponent } from 'src/app/modals/view-product-detail/view-product-detail.component';
import { BottleManagerComponent } from 'src/app/modals/bottle-manager/bottle-manager.component';
import { LoanManagerComponent } from 'src/app/modals/loan-manager/loan-manager.component';
import { FractionManagerComponent } from 'src/app/modals/fraction-manager/fraction-manager.component';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {
  
  /* ---------------- FILTRAR INGREDIENTES ---------------- */
filterLocation: string = '';
locations: any[] = [];
proveedores: any[] = [];
filterProveedorIng: string = '';
filterProveedorProd: string = '';
filterNombre: string = '';
filterUnidad: string = '';
filterNivelStock: string = '';
unidadesDisponibles: string[] = [];
subcategories: any[] = [];
subcategoriesByCategory: any = {};
expandedCategories: any = {};
expandedProductGroups:any = {};
showSubcatManager: boolean = false;
filterNivelProducto: string = '';
selectedCategoryForSub: any = null;

subcatForm = {
  id: null,
  name: ''
};
loadSubcategories() {
  this.server.getSubcategories().subscribe((res: any) => {
    if (res.error === 0) {
      this.subcategories = res.data;
      this.buildSubcategoryMap(); 
    }
  });
}
toggleCategory(catId: any) {
  this.expandedCategories[catId] = !this.expandedCategories[catId];
}
get filteredIngredients() {

  let data = this.ingredients.filter(ing => {

    const matchNombre =
      ing.nombre.toLowerCase()
      .includes(this.filterNombre.toLowerCase());

    const matchUnidad =
      ing.unidad_med.toLowerCase()
      .includes(this.filterUnidad.toLowerCase());

    const matchLocation =
      this.filterLocation === ''
        ? true
        : (ing.location_id == this.filterLocation);

    const matchProveedor =
      this.filterProveedorIng === ''
        ? true
        : (ing.nombre_proveedor === this.filterProveedorIng);

    const matchNivel =
      this.filterNivelStock === ''
        ? true
        : this.getStockLevel(ing) === this.filterNivelStock;

    return (
      matchNombre &&
      matchUnidad &&
      matchLocation &&
      matchProveedor &&
      matchNivel
    );
  });

  if (this.sortField) {

    data.sort((a: any, b: any) => {

      let A = a[this.sortField];
      let B = b[this.sortField];

      if (typeof A === 'string') {
        A = A.toLowerCase();
        B = B.toLowerCase();
      }

      if (A < B)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (A > B)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  return this.paginate(data, this.pageIngredients);
}
  /* ---------------- FILTRAR PRODUCTOS ---------------- */
filterProducto: string = '';
categories: any[] = [];
filterState: string = 'todos';


/*--------------------FILTRAR ASSETS----------------*/
// --- Al inicio de la clase ---
filterAssetNombre: string = '';
filterAssetCategoria: string = '';
assetCategories: string[] = ['Muebles', 'Cubiertos', 'Cristalería', 'Maquinaria', 'Decoración', 'Electrónicos', 'Uniformes'];

editingAssetId: number | null = null;
/* ---------------- AL INICIAR ---------------- */
ngOnInit() {
  this.loadIngredients();
  this.loadCategories();
  this.loadSubcategories();
  this.loadLocations();
  this.loadProveedores();
}
  segment: string = 'ingredients';

  ingredients: any[] = [];
  products: any[] = [];
  assets: any[] = [];

  nuevoAsset = {
    nombre: '',
    categoria: '',
    stock: 0
  };

  constructor(

  private server: ServerContentService,

  private modalCtrl: ModalController,

  private toastCtrl: ToastController,

  private alertCtrl: AlertController

) {}

  ionViewWillEnter() {
    this.loadIngredients();
    this.loadAssets();
    this.loadProducts();
  }
segmentChanged() {
  // Limpiamos la lista actual para que el usuario vea que está cargando lo nuevo
  this.assets = []; 


  if (this.segment === 'ingredients') this.loadIngredients();
  if (this.segment === 'assets') this.loadAssets();
  if (this.segment === 'products') this.loadProducts();
}
   filteredSubcategories() {
  if (!this.selectedCategoryForSub) return [];

  return this.subcategories.filter(
    s => s.id_category == this.selectedCategoryForSub
  );
}resetSubcatForm() {
  this.subcatForm = { id: null, name: '' };
}
loadProveedores() {
  const system = this.server.getSystem();

  this.server.getProveedor(system).subscribe((res: any) => {
    this.proveedores = res;
  });
}
editSubcategory(sub: any) {
  this.subcatForm = {
    id: sub.id_subcategory,
    name: sub.name
  };
  this.selectedCategoryForSub = sub.id_category;
}saveSubcategory() {
  if (!this.subcatForm.name.trim() || !this.selectedCategoryForSub) return;

const payload = {
  id: this.subcatForm.id, 
  name: this.subcatForm.name,
  id_category: this.selectedCategoryForSub
};

  if (this.subcatForm.id) {
    // UPDATE
    this.server.updateSubcategory(payload).subscribe(() => {
      this.loadSubcategories();
      this.resetSubcatForm();
    });
  } else {
  // CREATE
  this.server.createSubcategory(
    this.subcatForm.name,
    this.selectedCategoryForSub
  ).subscribe(() => {
    this.loadSubcategories();
    this.resetSubcatForm();
  });
}
}


deleteSubcategory(id: any) {
  if (confirm('¿Eliminar subcategoría?')) {
    this.server.deleteSubcategory(id).subscribe(() => {
      this.loadSubcategories();
    });
  }
}
  /* ---------------- INGREDIENTES ---------------- */
loadIngredients() {
  this.server.getIngredients().subscribe((res: any) => {
    if (res.error === 0) {
      this.ingredients = res.data;
      // Extraemos unidades únicas: ['kg', 'litros', etc.]
      const todasLasUnidades = this.ingredients.map(ing => ing.unidad_med);
      this.unidadesDisponibles = [...new Set(todasLasUnidades)]; 
    }
  });
}
  updateStock(ingredient: any) {
    this.server.updateStock({
      id_ingredient: ingredient.id_ingredients,
      stock_act: ingredient.stock_act
    }).subscribe(() => {
      this.loadIngredients();
    });
  }

  /* ---------------- ASSETS ---------------- */
  loadAssets() {
  this.server.getAssets().subscribe((res: any) => {
    if (res.error === 0) {
      this.assets = res.data.map((a: any) => {
        // Normalizamos: si no hay estado, es Activo. 
        // Si hay, lo pasamos a Primera Mayúscula (Activo/Inactivo)
        let estadoDb = a.estado ? a.estado.toLowerCase() : 'activo';
        return {
          ...a,
          estado: estadoDb === 'activo' ? 'Activo' : 'Inactivo'
        };
      });
    }
  });
}
  /* ---------------- PRODUCTS ---------------- */

  loadProducts() {
    this.server.getProducts().subscribe((res: any) => {
      if (res.error === 0) {
        this.products = res.data;
      }
    });
  }

async showIngredientModal(ingredient: any = null) {

  const modal = await this.modalCtrl.create({
    component: CreateIngredientComponent,
    componentProps: {
      ingredient: ingredient
    }
  });

  modal.onDidDismiss().then(res => {
    if (res.data) {
      this.loadIngredients();
    }
  });

  await modal.present();
}
async openCreateModal() {

  if (this.segment === 'ingredients') {
    this.showIngredientModal();
  }

}
verDetalles(ingredient: any) {
  console.log('Mostrando detalles de:', ingredient);
  // Aquí puedes abrir otro modal o navegar a una página de detalle
  // this.navCtrl.navigateForward(['/detalle-ingrediente', ingredient.id_ingredients]);
}
loadCategories() {
  this.server.getCategories().subscribe((res: any) => {
    if (res.error === 0) this.categories = res.data;
  });
}
getCategoryName(id: any) {
  const cat = this.categories.find(c => c.id == id);
  return cat ? cat.name : 'Sin categoría';
}
get filteredProducts() {

  let data = this.products.filter(p => {

    const matchNombre =
      p.nombre_producto
        .toLowerCase()
        .includes(this.filterProducto.toLowerCase());

    const matchState =
      this.filterState === 'todos'
        ? true
        : p.state === this.filterState;

    const matchProveedor =
      this.filterProveedorProd === ''
        ? true
        : p.nombre_proveedor === this.filterProveedorProd;

    const matchNivel =
      this.filterNivelProducto === ''
        ? true
        : this.getStockLevel(p) === this.filterNivelProducto;
const matchCategoria =
  this.filterCategoriaProducto === ''
    ? true
    : p.id_category == this.filterCategoriaProducto;

const matchPrecio =
  this.filterPrecio === ''
    ? true
    : p.price.toString().includes(this.filterPrecio);
return (
  matchNombre &&
  matchState &&
  matchProveedor &&
  matchNivel &&
  matchCategoria &&
  matchPrecio
);
  });

  if (this.sortProductsField) {

    data.sort((a: any, b: any) => {

      let A = a[this.sortProductsField];
      let B = b[this.sortProductsField];

      if (typeof A === 'string') {
        A = A.toLowerCase();
        B = B.toLowerCase();
      }

      if (A < B)
        return this.sortProductsDirection === 'asc' ? -1 : 1;

      if (A > B)
        return this.sortProductsDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  return this.paginate(data, this.pageProducts);
}
async openCreateProductModal(product: any = null) {
  const modal = await this.modalCtrl.create({
    component: CreateProductComponent, 
    componentProps: { product: product }
  });
  modal.onDidDismiss().then(() => this.loadProducts());
  await modal.present();
}
async verDetalle(prod: any) {
  console.log('Abriendo detalle de:', prod); // Esto confirma que el click funciona
  
  const modal = await this.modalCtrl.create({
    component: ViewProductDetailComponent,
    componentProps: { 
      product: prod // Aquí pasamos el objeto que viste en consola
    }
  });
  
  return await modal.present();
}
async toggleProductState(product: any) {
  const newState = (product.state === 'active') ? 'inactive' : 'active';
  
  this.server.updateProductState(product.id_product, newState).subscribe((res: any) => {
    if (res.success) {
      product.state = newState; // Actualizamos visualmente sin recargar todo
    }
  });
}
get filteredAssets() {

  let data = this.assets.filter(a => {
const matchEstado =
  this.filterAssetEstado === ''
    ? true
    : a.estado === this.filterAssetEstado;

    const matchNombre =
      a.nombre.toLowerCase()
      .includes(this.filterAssetNombre.toLowerCase());

    const matchCat =
      this.filterAssetCategoria === ''
        ? true
        : a.categoria === this.filterAssetCategoria;

   return (
  matchNombre &&
  matchCat &&
  matchEstado
);
  });

  if (this.sortAssetsField) {

    data.sort((a: any, b: any) => {

      let A = a[this.sortAssetsField];
      let B = b[this.sortAssetsField];

      if (typeof A === 'string') {
        A = A.toLowerCase();
        B = B.toLowerCase();
      }

      if (A < B)
        return this.sortAssetsDirection === 'asc' ? -1 : 1;

      if (A > B)
        return this.sortAssetsDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  return this.paginate(data, this.pageAssets);
}
// --- Modifica el crearAsset para que limpie el formulario ---
crearAsset() {
  if (!this.nuevoAsset.nombre || !this.nuevoAsset.categoria) {
    alert("Por favor llena nombre y categoría");
    return;
  }

  this.server.addAsset(this.nuevoAsset).subscribe({
    next: (res: any) => {
      if (res.error === 0) {
        console.log('Asset creado con éxito');
        this.nuevoAsset = { nombre: '', categoria: '', stock: 0 }; // Limpiar
        this.loadAssets(); // Recargar la tabla
      } else {
        console.error('Error del servidor:', res.message);
      }
    },
    error: (err) => {
      console.error('Error de red/CORS:', err);
    }
  });
}
prepararEditarAsset(asset: any) {
  this.editingAssetId = asset.id_asset; // Guardamos el ID
  this.nuevoAsset = { 
    nombre: asset.nombre, 
    categoria: asset.categoria, 
    stock: asset.stock 
  };
}
guardarAsset() {
  if (!this.nuevoAsset.nombre || !this.nuevoAsset.categoria) return;

  if (this.editingAssetId) {
    // LÓGICA DE EDICIÓN
    const payload = { ...this.nuevoAsset, id_asset: this.editingAssetId, system: this.server.getSystem() };
    this.server.updateAssetFull(payload).subscribe((res: any) => {
      this.finalizarGuardado();
    });
  } else {
    // LÓGICA DE CREACIÓN (la que ya tienes)
    this.server.addAsset(this.nuevoAsset).subscribe((res: any) => {
      this.finalizarGuardado();
    });
  }
}

finalizarGuardado() {
  this.nuevoAsset = { nombre: '', categoria: '', stock: 0 };
  this.editingAssetId = null;
  this.loadAssets();
}
// En tu InventarioPage...
async toggleAssetState(asset: any) {
  // Simplificamos la lógica: si es Activo -> Inactivo, si no -> Activo
  const nuevoEstado = (asset.estado === 'Activo') ? 'Inactivo' : 'Activo';
  
  const payload = {
    id_asset: asset.id_asset,
    estado: nuevoEstado,
    system: this.server.getSystem()
  };

  this.server.updateAssetState(payload).subscribe((res: any) => {
    if (res.success) {
      asset.estado = nuevoEstado; 
    }
  });
}

async gestionarfracciones(ingredient: any) {
 
  console.log("Gestionando fracciones de:", ingredient.nombre);
  
  const modal = await this.modalCtrl.create({
    component: FractionManagerComponent, 
    componentProps: {
      ingredient: ingredient
    }
  });

  modal.onDidDismiss().then(res => {
    this.loadIngredients(); 
  });

  return await modal.present();
}
async gestionarBotellas(ingredient: any) {
  console.log("Gestionando botellas de:", ingredient.nombre);
  
  const modal = await this.modalCtrl.create({
    component: BottleManagerComponent, // Necesitas crear este componente
    componentProps: {
      ingredient: ingredient
    }
  });

  modal.onDidDismiss().then(res => {
    this.loadIngredients(); // Recargamos para ver el nuevo stock sumado
  });

  return await modal.present();
}
// --- Al inicio de la clase ---
showCatManager: boolean = false;
catForm = { id: null, name: '' };

// --- Dentro de la clase InventarioPage ---

// Reiniciar formulario
resetCatForm() {
  this.catForm = { id: null, name: '' };
}

// Preparar edición
editCategory(cat: any) {
  this.catForm = { id: cat.id, name: cat.name };
}

// Guardar (Crear o Editar)
saveCategory() {
  if (!this.catForm.name.trim()) return;

  if (this.catForm.id) {
    // EDITAR
    this.server.updateCategory(this.catForm).subscribe((res: any) => {
      this.loadCategories();
      this.resetCatForm();
    });
  } else {
    // CREAR
    this.server.addCategory(this.catForm.name).subscribe((res: any) => {
      this.loadCategories();
      this.resetCatForm();
    });
  }
}

// Eliminar
async deleteCategory(id: any) {
  if (confirm('¿Estás seguro? Los productos en esta categoría podrían quedar huérfanos.')) {
    this.server.deleteCategory(id).subscribe((res: any) => {
      this.loadCategories();
    });
  }
}
async openLoanModal() {
  const modal = await this.modalCtrl.create({
    component: LoanManagerComponent,
    componentProps: {
      type: (this.segment === 'ingredients') ? 'ingredient' : 'product'
    }
  });

  modal.onDidDismiss().then(res => {
    if (res.data) {
      if (this.segment === 'ingredients') this.loadIngredients();
      else this.loadProducts();
    }
  });

  return await modal.present();
}

loadLocations() {
  this.server.getLocations().subscribe((res: any) => {
    if (res.error === 0) {
      this.locations = res.data;
    }
  });
}
buildSubcategoryMap() {
  this.subcategoriesByCategory = {};

  this.subcategories.forEach(sub => {
    if (!this.subcategoriesByCategory[sub.id_category]) {
      this.subcategoriesByCategory[sub.id_category] = [];
    }
    this.subcategoriesByCategory[sub.id_category].push(sub);
  });
}
// ========================================
// EVALUAR NIVEL STOCK
// ========================================

getStockLevel(item: any): string {


  // =========================
// PRODUCTOS
// =========================
// =========================
// PRODUCTOS
// =========================
if (item.stock_disponible !== undefined) {

  const stock = Number(item.stock_disponible || 0);
  const minimo = Number(item.stock_minimo || 1);

  if (stock <= 0) {
    return 'inexistente';
  }

  if (stock <= minimo) {
    return 'muy_poco';
  }

  if (stock <= minimo * 3) {
    return 'medio';
  }

  return 'lleno';
}
  if (item.tipo === 'normal') {

    const stock = Number(item.stock_act || 0);

    if (stock <= 0) return 'inexistente';
    if (stock <= 5) return 'muy_poco';
    if (stock <= 15) return 'medio';

    return 'lleno';
  }

  // =========================
  // BOTELLA
  // =========================
  if (item.tipo === 'botella') {

    const stock = Number(item.stock_act || 0);

    if (stock <= 0) return 'inexistente';
    if (stock <= 300) return 'muy_poco';
    if (stock <= 1000) return 'medio';

    return 'lleno';
  }

  // =========================
  // FRACCIONADO
  // =========================
  if (item.tipo === 'fraccionado') {

    const stock = Number(item.stock_act || 0);

    if (stock <= 0) return 'inexistente';
    if (stock <= 5) return 'muy_poco';
    if (stock <= 20) return 'medio';

    return 'lleno';
  }

  return 'medio';
}
getStockClass(item: any): string {

  const level = this.getStockLevel(item);

  switch(level) {

    case 'inexistente':
      return 'stock-red';

    case 'muy_poco':
      return 'stock-orange';

    case 'medio':
      return 'stock-yellow';

    case 'lleno':
      return 'stock-green';

    default:
      return '';
  }
}getStockLabel(item: any): string {

  const level = this.getStockLevel(item);

  switch(level) {

    case 'inexistente':
      return 'Sin stock';

    case 'muy_poco':
      return 'Muy poco';

    case 'medio':
      return 'Medio';

    case 'lleno':
      return 'Lleno';

    default:
      return '';
  }
}
// ========================================
// ORDENAMIENTO
// ========================================

sortField: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortProductsField: string = '';
sortProductsDirection: 'asc' | 'desc' = 'asc';

sortAssetsField: string = '';
sortAssetsDirection: 'asc' | 'desc' = 'asc';

sort(field: string) {
  if (this.sortField === field) {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    this.sortDirection = 'asc';
  }
}

sortProducts(field: string) {
  if (this.sortProductsField === field) {
    this.sortProductsDirection =
      this.sortProductsDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortProductsField = field;
    this.sortProductsDirection = 'asc';
  }
}

sortAssets(field: string) {
  if (this.sortAssetsField === field) {
    this.sortAssetsDirection =
      this.sortAssetsDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortAssetsField = field;
    this.sortAssetsDirection = 'asc';
  }
}
// ========================================
// PAGINACION
// ========================================

pageIngredients = 1;
pageProducts = 1;
pageAssets = 1;

pageSize = 10;

pageSizeOptions = [
  5,
  10,
  20,
  30,
  50,
  100
];
changePageSize() {

  this.pageIngredients = 1;
  this.pageProducts = 1;
  this.pageAssets = 1;

}


paginate(array: any[], page: number) {
  const start = (page - 1) * this.pageSize;
  return array.slice(start, start + this.pageSize);
}

totalPages(array: any[]) {
  return Math.ceil(array.length / this.pageSize);
}
clearIngredientFilters() {

  this.filterNombre = '';
  this.filterUnidad = '';
  this.filterLocation = '';
  this.filterProveedorIng = '';
  this.filterNivelStock = '';

  this.sortField = '';
  this.pageIngredients = 1;
}
clearProductFilters() {

  this.filterProducto = '';

  this.filterState = 'todos';

  this.filterProveedorProd = '';

  this.filterNivelProducto = '';

  this.filterPrecio = '';

  this.filterCategoriaProducto = '';

  // NUEVO

  this.groupByProduct = 'none';

  this.sortProductsField = '';

  this.pageProducts = 1;
   this.groupByProduct='none';

}
get groupedProductsByType() {

  const grupos:any = {};

  this.filteredProducts.forEach((p:any)=>{

    let key = 'Todos';

    switch(this.groupByProduct){

      case 'category':

        key =
          this.getCategoryName(
            p.id_category
          );

      break;

      case 'subcategory':

        key =
          p.nombre_subcategoria
          || 'Sin subcategoría';

      break;

    }

    if(!grupos[key]){

      grupos[key] = [];

    }

    grupos[key].push(p);

  });

  return grupos;

}
groupProductsByName(products:any[]) {

  const grupos:any = {};

  products.forEach((p:any)=>{

    const palabrasIgnorar = [

      'extra',

      'premium',

      'de',

      'con',

      'doble',

      'clasica',

      'especial'

    ];

    const palabras =

      this.normalizeName(
        p.nombre_producto
      )

      .split(' ')

      .filter(
        x=>
        !palabrasIgnorar.includes(x)
      );

    const key = palabras[0];

    if(!grupos[key]){

      grupos[key]={

        nombre:

        key.charAt(0)
        .toUpperCase()

        +

        key.slice(1),

        items:[]

      };

    }

    grupos[key].items.push(p);

  });

  return Object.values(grupos);

}

clearAssetFilters() {

  this.filterAssetNombre = '';
  this.filterAssetCategoria = '';

  this.sortAssetsField = '';
  this.pageAssets = 1;
}
filterPrecio = '';

filterCategoriaProducto = '';

filterAssetEstado = '';
groupByProduct: string = 'none';
getPaginationInfo(total: number, page: number) {

  const start =
    ((page - 1) * this.pageSize) + 1;

  const end =
    Math.min(
      page * this.pageSize,
      total
    );

  return {
    start,
    end,
    total
  };
}
async confirmarEliminarIngrediente(ing:any){

const alert=await this.alertCtrl.create({

header:'Eliminar ingrediente',

message:`¿Deseas eliminar "${ing.nombre}"?`,

buttons:[

{
text:'Cancelar',
role:'cancel'
},

{
text:'Eliminar',

role:'destructive',

handler:()=>{

this.eliminarIngrediente(ing);

}

}

]

});

await alert.present();

}
async confirmarEliminarProducto(prod:any){

const alert=await this.alertCtrl.create({

header:'Eliminar producto',

message:

`¿Deseas eliminar "${prod.nombre_producto}"?`,

buttons:[

{

text:'Cancelar',

role:'cancel'

},

{

text:'Eliminar',

role:'destructive',

handler:()=>{

this.eliminarProducto(prod);

}

}

]

});

await alert.present();

}
async confirmarEliminarAsset(asset:any){

const alert=await this.alertCtrl.create({

header:'Eliminar asset',

message:

`¿Deseas eliminar "${asset.nombre}"?`,

buttons:[

{

text:'Cancelar',

role:'cancel'

},

{

text:'Eliminar',

role:'destructive',

handler:()=>{

this.eliminarAsset(asset);

}

}

]

});

await alert.present();

}
eliminarIngrediente(item:any){

  const body = new FormData();

  body.append(
    "id_ingredient",
    item.id_ingredients
  );

  body.append(
    "system",
    this.server.getSystem()
  );

  this.server
    .deleteIngredient(body)
    .subscribe({

      next:(res:any)=>{

        if(res.error == 0){

          this.presentToast(
            "Ingrediente eliminado",
            "success"
          );

          this.loadIngredients();

        }else{

          this.presentToast(
            res.message,
            "danger"
          );

        }

      },

      error:()=>{

        this.presentToast(
          "Error del servidor",
          "danger"
        );

      }

    });

}
eliminarProducto(item:any){

  const body = new FormData();

  body.append(
    "id_product",
    item.id_product
  );

  body.append(
    "system",
    this.server.getSystem()
  );

  this.server
    .deleteProduct(body)
    .subscribe({

      next:(res:any)=>{

        if(res.error == 0){

          this.presentToast(
            "Producto eliminado",
            "success"
          );

          this.loadProducts();

        }else{

          this.presentToast(
            res.message,
            "danger"
          );

        }

      },

      error:()=>{

        this.presentToast(
          "Error del servidor",
          "danger"
        );

      }

    });

}
eliminarAsset(item:any){

  const body = new FormData();

  body.append(
    "id_asset",
    item.id_asset
  );

  body.append(
    "system",
    this.server.getSystem()
  );

  this.server
    .deleteAsset(body)
    .subscribe({

      next:(res:any)=>{

        if(res.error == 0){

          this.presentToast(
            "Asset eliminado",
            "success"
          );

          this.loadAssets();

        }else{

          this.presentToast(
            res.message,
            "danger"
          );

        }

      },

      error:()=>{

        this.presentToast(
          "Error del servidor",
          "danger"
        );

      }

    });

}
async presentToast(
  message: string,
  color: string
) {

  const toast =
    await this.toastCtrl.create({

      message,

      color,

      duration: 2000,

      position: 'bottom'

    });

  await toast.present();

}
get groupedProducts(): any[] {

  const categorias:any = {};

  this.filteredProducts.forEach((p:any)=>{

    // -------------------------
    // GRUPO PRINCIPAL
    // -------------------------

    let categoria='Todos';

    if(this.groupByProduct=='category'){

      categoria =
        this.getCategoryName(
          p.id_category
        );

    }

else if (this.groupByProduct == 'subcategory') {

  categoria =
    p.subcategory_name
    || 'Sin subcategoría';

}


    // -------------------------
    // GRUPO POR NOMBRE
    // -------------------------

    const palabrasIgnorar=[

      'extra',
      'premium',
      'de',
      'con',
      'doble',
      'clasica',
      'especial'

    ];

    const palabras=

      this.normalizeName(
        p.nombre_producto
      )

      .split(' ')

      .filter(

        x=>

        !palabrasIgnorar.includes(x)

      );


    const nombreGrupo =

      palabras[0]
      || 'Otros';


    // -------------------------
    // CREAR CATEGORIA
    // -------------------------

    if(!categorias[categoria]){

      categorias[categoria]={

        categoria: categoria,

        grupos:{}

      };

    }


    // -------------------------
    // CREAR SUBGRUPO
    // -------------------------

    if(

      !categorias[categoria]

      .grupos[nombreGrupo]

    ){

      categorias[categoria]

      .grupos[nombreGrupo]={

        nombre:

        nombreGrupo

          .charAt(0)

          .toUpperCase()

        +

        nombreGrupo.slice(1),

        items:[]

      };

    }


    categorias[categoria]

    .grupos[nombreGrupo]

    .items

    .push(p);

  });


  return Object.values(categorias)

  .map((cat:any)=>({

    categoria: cat.categoria,

    grupos:

      Object.values(

        cat.grupos

      )

  }));

}
toggleProductGroup(nombre:string){

  this.expandedProductGroups[nombre]
    = !this.expandedProductGroups[nombre];

}
normalizeName(text: string): string {

  return text
    .toLowerCase()

    // quitar tildes
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

    // quitar números
    .replace(/\d+/g, '')

    // quitar ml, l, kg, gr
    .replace(/\b(ml|l|lt|kg|gr|g|oz)\b/g, '')

    // quitar símbolos
    .replace(/[^a-zA-Z\s]/g, '')

    // espacios dobles
    .replace(/\s+/g, ' ')

    .trim();
}
toggleAllProductGroups() {

  const hayCerrados = this.groupedProducts.some(cat =>
    cat.grupos.some((g:any) =>
      !this.expandedProductGroups[g.nombre]
    )
  );

  this.groupedProducts.forEach(cat => {

    cat.grupos.forEach((g:any) => {

      this.expandedProductGroups[g.nombre] = hayCerrados;

    });

  });

}
areAllGroupsExpanded(): boolean {

  if (this.groupedProducts.length === 0) {
    return false;
  }

  return this.groupedProducts.every(cat =>

    cat.grupos.every((g:any)=>

      this.expandedProductGroups[g.nombre]

    )

  );

}

}


