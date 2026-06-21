import { Component } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { DateFilterModalComponent } from 'src/app/modals/date-filter-modal/date-filter-modal.component';
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
// NUEVAS LIBRERÍAS DE EXPORTACIÓN
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
showDateFilters=false;

dateMode='single';

dateFilterType='day';

selectedDate='';

startDate='';

endDate='';
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
matchNivel &&

this.matchDate(ing)

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
matchPrecio &&

this.matchDate(p)

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

return(

matchNombre &&
matchCat &&
matchEstado &&

this.matchDate(a)

)
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
  const grupos: any = {};

  // Cambiado a filteredProducts para asegurar que herede los filtros de fechas y palabras clave
  this.filteredProducts.forEach((p: any) => {
    let key = 'Todos';

    switch (this.groupByProduct) {
      case 'category':
        key = this.getCategoryName(p.id_category);
        break;
      case 'subcategory':
        key = p.nombre_subcategoria || 'Sin subcategoría';
        break;
    }

    if (!grupos[key]) {
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
matchDate(item: any) {
  if (!item.created_at) {
    return false;
  }

  // Corregir desfase de zona horaria forzando la lectura local del String (reemplazando espacios por 'T')
  // o asegurando que se evalúe solo año, mes y día.
  const dateStr = item.created_at.includes('T') ? item.created_at : item.created_at.replace(' ', 'T');
  const fechaItem = new Date(dateStr);

  // Si la fecha es inválida, no filtrar
  if (isNaN(fechaItem.getTime())) return true;

  // ========================================
  // MODO: FECHA ESPECÍFICA (SINGLE)
  // ========================================
  if (this.dateMode === 'single') {
    if (!this.selectedDate) {
      return true;
    }

    const fechaSel = new Date(this.selectedDate.includes('T') ? this.selectedDate : this.selectedDate + 'T00:00:00');

    // Filtrar por DÍA exacto
    if (this.dateFilterType === 'day') {
      return (
        fechaItem.getFullYear() === fechaSel.getFullYear() &&
        fechaItem.getMonth() === fechaSel.getMonth() &&
        fechaItem.getDate() === fechaSel.getDate()
      );
    }

    // Filtrar por MES entero
    if (this.dateFilterType === 'month') {
      return (
        fechaItem.getFullYear() === fechaSel.getFullYear() &&
        fechaItem.getMonth() === fechaSel.getMonth()
      );
    }

    // Filtrar por AÑO entero
    if (this.dateFilterType === 'year') {
      return fechaItem.getFullYear() === fechaSel.getFullYear();
    }
  }

  // ========================================
  // MODO: RANGO DE FECHAS (RANGE)
  // ========================================
  if (this.dateMode === 'range') {
    if (!this.startDate || !this.endDate) {
      return true;
    }

    let inicio = new Date(this.startDate.includes('T') ? this.startDate : this.startDate + 'T00:00:00');
    let fin = new Date(this.endDate.includes('T') ? this.endDate : this.endDate + 'T00:00:00');

    // SI EL FILTRO ES POR AÑO EN MODO RANGO:
    // Ajustamos el rango automático para abarcar desde el 1 de Enero del año de inicio 
    // hasta el 31 de Diciembre del año de fin.
    if (this.dateFilterType === 'year') {
      inicio = new Date(inicio.getFullYear(), 0, 1, 0, 0, 0, 0);
      fin = new Date(fin.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (this.dateFilterType === 'month') {
      // Ajuste opcional para meses enteros en rango: Del día 1 de ese mes al último día de ese mes
      inicio = new Date(inicio.getFullYear(), inicio.getMonth(), 1, 0, 0, 0, 0);
      fin = new Date(fin.getFullYear(), fin.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // Días estándar
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
    }

    return (
      fechaItem.getTime() >= inicio.getTime() &&
      fechaItem.getTime() <= fin.getTime()
    );
  }

  return true;
}
clearDateFilter(){

  this.dateFilterType='day';

  this.dateMode='single';

  this.selectedDate='';

  this.startDate='';

  this.endDate='';
  this.refreshCurrentSegment();

}
// Método para desplegar el modal sobresaliente corregido
  async openDateFilterModal() {
    const modal = await this.modalCtrl.create({
      component: DateFilterModalComponent,
      cssClass: 'custom-date-modal', 
      componentProps: {
        dateMode: this.dateMode,
        dateFilterType: this.dateFilterType,
        selectedDate: this.selectedDate,
        startDate: this.startDate,
        endDate: this.endDate
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Mapeamos los filtros configurados en el modal a la página principal
        this.dateMode = result.data.dateMode;
        this.dateFilterType = result.data.dateFilterType;
        this.selectedDate = result.data.selectedDate;
        this.startDate = result.data.startDate;
        this.endDate = result.data.endDate;

        // Si el usuario presionó el botón Limpiar en el modal
        if (result.data.cleared) {
          this.clearDateFilter();
        } else {
          // Si aplicó filtros, forzamos recarga o actualización de la vista actual
          this.refreshCurrentSegment();
        }
      }
    });

    return await modal.present();
  }
refreshCurrentSegment() {
    if (this.segment === 'ingredients') this.loadIngredients();
    if (this.segment === 'products') this.loadProducts();
    if (this.segment === 'assets') this.loadAssets();
  }
  // =========================================================================
  // LOGICA DE EXPORTACIÓN DETALLADA (EXCEL & PDF)
  // =========================================================================

  /**
   * Obtiene una descripción legible de todos los filtros aplicados en la tabla
   */
  getFilterDetailsText(): string {
    let detalles: string[] = [];

    // 1. Filtros de Fecha
    if (this.selectedDate || this.startDate || this.endDate) {
      const mode = this.dateMode === 'single' ? 'Fecha específica' : 'Rango';
      const type = this.dateFilterType === 'day' ? 'Día' : this.dateFilterType === 'month' ? 'Mes' : 'Año';
      if (this.dateMode === 'single' && this.selectedDate) {
        detalles.push(`Calendario: ${mode} (${type}) -> ${this.selectedDate.substring(0, 10)}`);
      } else if (this.dateMode === 'range') {
        const start = this.startDate ? this.startDate.substring(0, 10) : 'Inicio';
        const end = this.endDate ? this.endDate.substring(0, 10) : 'Fin';
        detalles.push(`Calendario: ${mode} (${type}) -> Desde: ${start} Hasta: ${end}`);
      }
    } else {
      detalles.push('Fechas: Todos los registros históricos');
    }

    // 2. Filtros de búsqueda por texto o selectores específicos según el segmento
    if (this.segment === 'ingredients') {
      if (this.filterLocation) detalles.push(`Ubicación ID: ${this.filterLocation}`);
      if (this.filterProveedorIng) detalles.push(`Proveedor ID: ${this.filterProveedorIng}`);
    } else if (this.segment === 'products') {
      if (this.filterProveedorProd) detalles.push(`Proveedor ID: ${this.filterProveedorProd}`);
    }

    return detalles.join(' | ');
  }

  /**
   * EXPORTAR A EXCEL (Incluye absolutamente todas las propiedades del JSON)
   */
  exportToExcel() {
    let dataToExport: any[] = [];
    let filename = `Reporte_Completo_${this.segment}`;

    // Agregar rango de fechas al nombre del archivo si aplica
    if (this.dateMode === 'single' && this.selectedDate) {
      filename += `_${this.selectedDate.substring(0, 10)}`;
    } else if (this.dateMode === 'range' && this.startDate && this.endDate) {
      filename += `_del_${this.startDate.substring(0, 10)}_al_${this.endDate.substring(0, 10)}`;
    }

    // Mapeo uno a uno de todos los datos recibidos del backend
    if (this.segment === 'ingredients') {
      dataToExport = this.filteredIngredients.map(ing => ({
        'ID Ingrediente': ing.id_ingredients,
        'Nombre': ing.nombre,
        'Tipo': ing.tipo,
        'Stock Actual': parseFloat(ing.stock_act || '0'),
        'Unidad de Medida': ing.unidad_med,
        'ID Ubicación': ing.location_id || 'Sin asignar',
        'ID Proveedor': ing.proveedor_id || 'N/A',
        'Nombre Proveedor': ing.nombre_proveedor || 'Sin proveedor',
        'Fecha de Creación': ing.created_at
      }));
    } else if (this.segment === 'products') {
      dataToExport = this.filteredProducts.map(prod => ({
        'ID Producto': prod.id_product,
        'Nombre Producto': prod.nombre_producto,
        'Alias': prod.alias || '',
        'Precio (Bs.)': parseFloat(prod.price || '0'),
        'Tiempo Preparación (Min)': parseInt(prod.time_prep || '0'),
        'Estado': prod.state,
        'Tipo Producto': prod.tipo_producto,
        'Stock Disponible': parseFloat(prod.stock_disponible || '0'),
        'Stock Congelado': parseFloat(prod.stock_congelado || '0'),
        'Stock Mínimo': parseFloat(prod.stock_minimo || '0'),
        'ID Categoría': prod.id_category || 'N/A',
        'ID Subcategoría': prod.id_subcategory || 'N/A',
        'Nombre Subcategoría': prod.subcategory_name || 'Sin subcategoría',
        'ID Cocina': prod.kitchen_id || 'N/A',
        'Nombre Cocina': prod.nombre_cocina || 'Sin asignar',
        'ID Proveedor': prod.proveedor_id || 'N/A',
        'Nombre Proveedor': prod.nombre_proveedor || 'Sin proveedor',
        'Fecha de Creación': prod.created_at || 'N/A'
      }));
    } else if (this.segment === 'assets') {
      dataToExport = this.filteredAssets.map(asset => ({
        'ID Activo': asset.id_asset,
        'Nombre del Bien': asset.nombre,
        'Categoría': asset.categoria,
        'Stock / Cantidad': parseInt(asset.stock || '0'),
        'Estado': asset.estado,
        'Fecha de Creación': asset.created_at
      }));
    }

    if (dataToExport.length === 0) {
      this.presentToast('No existen registros en la tabla actual para exportar.', 'warning');
      return;
    }

    // Crear y descargar libro Excel nativo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, this.segment.toUpperCase());

    // Autofit de ancho de celdas base
    worksheet['!cols'] = Object.keys(dataToExport[0]).map(() => ({ wch: 20 }));

    XLSX.writeFile(workbook, `${filename}.xlsx`);
    this.presentToast('Archivo Excel masivo descargado.', 'success');
  }

  /**
   * EXPORTAR A PDF (Diseño limpio y limitado para impresión bonita)
   */
  exportToPDF() {
    // Si es la tabla de productos, al tener más columnas usaremos orientación horizontal ('l') para que no se vea apretado
    const orientacion = this.segment === 'products' ? 'l' : 'p';
    const doc = new jsPDF(orientacion, 'pt', 'a4');
    
    let titleReport = '';
    let headers: string[][] = [];
    let bodyData: any[][] = [];

    // Limitamos las columnas estratégicamente para el PDF impreso
    if (this.segment === 'ingredients') {
      titleReport = 'REPORTE IMPRESO DE INGREDIENTES';
      headers = [['ID', 'Nombre', 'Tipo', 'Stock Act.', 'U. Medida', 'Proveedor']];
      bodyData = this.filteredIngredients.map(ing => [
        ing.id_ingredients,
        ing.nombre,
        ing.tipo,
        ing.stock_act,
        ing.unidad_med,
        ing.nombre_proveedor || '-'
      ]);
    } else if (this.segment === 'products') {
      titleReport = 'REPORTE IMPRESO DE PRODUCTOS EN SISTEMA';
      // Ajustado para encajar perfectamente en layout Horizontal
      headers = [['ID', 'Nombre Producto', 'Precio', 'Stock Disp.', 'Stock Cong.', 'Cocina / Área', 'Proveedor']];
      bodyData = this.filteredProducts.map(prod => [
        prod.id_product,
        prod.nombre_producto,
        `${prod.price} Bs.`,
        prod.stock_disponible,
        prod.stock_congelado,
        prod.nombre_cocina || 'Sin asignar',
        prod.nombre_proveedor || '-'
      ]);
    } else if (this.segment === 'assets') {
      titleReport = 'REPORTE IMPRESO DE ACTIVOS Y BIENES';
      headers = [['ID Activo', 'Nombre del Bien / Elemento', 'Categoría Asociada', 'Cant. Stock', 'Estado']];
      bodyData = this.filteredAssets.map(asset => [
        asset.id_asset,
        asset.nombre,
        asset.categoria,
        asset.stock,
        asset.estado.toUpperCase()
      ]);
    }

    if (bodyData.length === 0) {
      this.presentToast('No hay datos filtrados para plasmar en el PDF.', 'warning');
      return;
    }

    const anchoPagina = doc.internal.pageSize.width;

    // --- ENCABEZADO ESTÉTICO ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text(titleReport, 40, 45);

    // Línea decorativa del color del sistema
    doc.setDrawColor(56, 128, 255);
    doc.setLineWidth(2.5);
    doc.line(40, 53, anchoPagina - 40, 53);

    // Tarjeta o bloque gris de "Detalles de Filtrado"
    doc.setFillColor(248, 249, 250);
    doc.rect(40, 68, anchoPagina - 80, 42, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(108, 117, 125);
    doc.text('CRITERIOS DE FILTRADO ACTIVOS EN LA TABLA:', 50, 82);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(49, 53, 59);
    // Controlamos si el texto de los filtros es muy largo para que no se salga de la caja
    const filterText = this.getFilterDetailsText();
    const splitFilterText = doc.splitTextToSize(filterText, anchoPagina - 100);
    doc.text(splitFilterText, 50, 96);

    // --- TABLA ESTILIZADA ---
    autoTable(doc, {
      head: headers,
      body: bodyData,
      startY: 125,
      margin: { left: 40, right: 40 },
      theme: 'striped',
      headStyles: {
        fillColor: [43, 48, 53], // Gris oscuro premium profesional
        textColor: [255, 255, 255],
        fontSize: 9.5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 37, 41]
      },
      alternateRowStyles: {
        fillColor: [251, 252, 253]
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 6
      },
      didDrawPage: (data) => {
        // Numeración de páginas abajo a la izquierda
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 142, 145);
        doc.text(`Página ${data.pageNumber}`, 40, doc.internal.pageSize.height - 20);
        
        // Fecha y hora exacta de la impresión abajo a la derecha
        const ahora = new Date().toLocaleString('es-ES', { hour12: false });
        doc.text(`Fecha de Impresión: ${ahora}`, anchoPagina - 180, doc.internal.pageSize.height - 20);
      }
    });

    // Guardar el documento PDF
    doc.save(`Reporte_${this.segment}_Filtrado.pdf`);
    this.presentToast('PDF guardado listo para imprimir.', 'success');
  }
}


