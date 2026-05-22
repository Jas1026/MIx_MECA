import { Component } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController } from '@ionic/angular';
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

  return this.ingredients.filter(ing => {

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

  constructor(private server: ServerContentService,   private modalCtrl: ModalController) {}

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

  return this.products.filter(p => {

    const matchNombre =
      p.nombre_producto.toLowerCase()
      .includes(this.filterProducto.toLowerCase());

    const matchState =
      (this.filterState === 'todos')
        ? true
        : (p.state === this.filterState);
const matchProveedor =
  this.filterProveedorProd === ''
    ? true
    : (p.nombre_proveedor === this.filterProveedorProd);

const matchNivel =
  this.filterNivelProducto === ''
    ? true
    : this.getStockLevel(p) === this.filterNivelProducto;

return (
  matchNombre &&
  matchState &&
  matchProveedor &&
  matchNivel
);
  });
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
// --- Getter para filtrar la tabla de Activos ---
get filteredAssets() {
  return this.assets.filter(a => {
    // Filtro por nombre (minúsculas para que no importe si escribes café o Café)
    const matchNombre = a.nombre.toLowerCase().includes(this.filterAssetNombre.toLowerCase());
    
    // Filtro por categoría (si está vacío muestra todo)
    const matchCat = this.filterAssetCategoria === '' ? true : a.categoria === this.filterAssetCategoria;
    
    return matchNombre && matchCat;
  });
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
}


