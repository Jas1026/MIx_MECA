import { Component } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController } from '@ionic/angular';
import { CreateIngredientComponent } from 'src/app/modals/create-ingredient/create-ingredient.component';
import { CreateProductComponent } from 'src/app/modals/create-product/create-product.component';
import { ViewProductDetailComponent } from 'src/app/modals/view-product-detail/view-product-detail.component';
import { BottleManagerComponent } from 'src/app/modals/bottle-manager/bottle-manager.component';
import { LoanManagerComponent } from 'src/app/modals/loan-manager/loan-manager.component';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})

export class InventarioPage {
  /* ---------------- FILTRAR INGREDIENTES ---------------- */
  // Dentro de la clase InventarioPage
filterNombre: string = '';
filterUnidad: string = '';
unidadesDisponibles: string[] = [];
// Nueva lista filtrada
get filteredIngredients() {
  return this.ingredients.filter(ing => {
    const matchNombre = ing.nombre.toLowerCase().includes(this.filterNombre.toLowerCase());
    const matchUnidad = ing.unidad_med.toLowerCase().includes(this.filterUnidad.toLowerCase());
    return matchNombre && matchUnidad;
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
    // Filtro por nombre
    const matchNombre = p.nombre_producto.toLowerCase().includes(this.filterProducto.toLowerCase());
    
    // Filtro por estado (activo/inactivo/todos)
    const matchState = (this.filterState === 'todos') ? true : (p.state === this.filterState);
    
    return matchNombre && matchState;
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
// Añade esta función dentro de la clase InventarioPage
async gestionarBotellas(ingredient: any) {
  // Aquí abriríamos un modal específico para las botellas de este ingrediente
  // Por ahora, para que no te de error, crearemos la lógica de apertura:
  
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
}


