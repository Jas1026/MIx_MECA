import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class OrderModalComponent implements OnInit {
@Input() order_id: any;
@Input() editMode: boolean = false;
  @Input() table: any;

  categories: any[] = [];
  products: any[] = [];
  cart: any[] = [];
searchTerm: string = '';
searchResults: any[] = [];
  selectedCategory: string = '';
  subcategories: any[] = [];
selectedSubcategory: any = null;
viewMode: 'categories' | 'subcategories' | 'products' = 'categories';
currentCategoryName: string = '';
  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
  this.loadCategories();

  if (this.editMode && this.order_id) {
    this.loadOrderDetails();
  }
  }

  loadCategories() {
  this.server.getCategories().subscribe((res: any) => {
    this.categories = res.data || res;
  });
}
selectCategory(cat: any) {

  this.currentCategoryName = cat.name;
  this.selectedCategory = cat.id;

  this.viewMode = 'subcategories'; // 🔥 ahora va aquí

  this.server.getSubcategories(cat.id)
    .subscribe((res: any) => {
      this.subcategories = res.data || res;
    });
}
selectSubcategory(sub: any) {

  this.selectedSubcategory = sub;

  this.viewMode = 'products';

  this.server.getProductsBySubcategory(sub.id_subcategory)
    .subscribe((res: any) => {
      this.products = res.data || res;
    });
}
goBack() {

  if (this.viewMode === 'products') {
    this.viewMode = 'subcategories';
  } else if (this.viewMode === 'subcategories') {
    this.viewMode = 'categories';
  }

  this.products = [];
}
addProduct(product: any) {
  const found = this.cart.find(p => p.id_product === product.id_product);

  if (found) {
    found.quantity++;
  } else {
    this.cart.push({
      id_product: product.id_product,
      name: product.name,
      price: product.price,
      quantity: 1,
      notes: '', // 👈 Inicializar
      sides: ''  // 👈 Inicializar
    });
  }
}
// En order-modal.component.ts
loadOrderDetails() {
  this.server.getOrderDetails(this.order_id).subscribe((res: any) => {
    if (res.error === 0) {
      this.cart = res.data.map((item: any) => ({
        id_product: item.product_id,
        name: item.nombre_producto, // Asegúrate de que el nombre coincida con el SQL
        price: item.unit_price,
        quantity: item.quantity,
        notes: item.notes || '', // <-- Ahora sí vendrá con info
        sides: item.sides || ''  // <-- Ahora sí vendrá con info
      }));
    }
  });
}
  removeProduct(product: any) {
    const index = this.cart.findIndex(p => p.id_product === product.id_product);

    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  getTotal() {
    return this.cart.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0);
  }
  confirmOrder() {
  const id_user = sessionStorage.getItem("user_id") || '';
  
  // IMPORTANTE: El servicio espera (id_table, id_user, products, force)
  // No pases el "system" aquí, el servicio ya lo obtiene internamente con this.getSystem()
  
  this.server.createOrder(this.table.id_table, id_user, this.cart, false)
    .subscribe({
      next: (res: any) => {
        if (res.error === 0) {
          alert("✅ " + res.message);
          this.modalCtrl.dismiss(true);
        } else if (res.error === 2) {
          // Bloqueo por falta de stock disponible
          alert("🚫 STOCK INSUFICIENTE:\n" + res.message);
        } else {
          alert("❌ Error: " + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert("Error de conexión con el servidor.");
      }
    });
}
// Cambiamos el método para que sea más limpio y maneje los errores de stock (error 2)
private executeOrder(id_user: string, force: boolean) {
  // Pasamos 'force' que es booleano, tal cual lo pide el service ahora
  this.server.createOrder(this.table.id_table, id_user, this.cart, force)
    .subscribe({
      next: async (res: any) => {
        if (res.error === 0) {
          alert("✅ Pedido enviado con éxito");
          this.modalCtrl.dismiss(true);
        } else if (res.error === 2) {
          // Si el PHP devuelve error 2 es que NO hay stock disponible
          alert("🚫 STOCK INSUFICIENTE: " + res.message);
        } else {
          alert("❌ Error: " + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert("Error de conexión con el servidor.");
      }
    });
}
// Eliminar el producto completamente del carrito, sin importar la cantidad
deleteFromCart(product: any) {
  this.cart = this.cart.filter(p => p.id_product !== product.id_product);
}

// Opcional: Limpiar todo el carrito
clearCart() {
  this.cart = [];
}
  close() {
    this.modalCtrl.dismiss();
  }


  searchProducts() {

  if (this.searchTerm.trim() === '') {
    this.searchResults = [];
    return;
  }

  this.server.searchProducts(this.searchTerm)
    .subscribe((res: any) => {

      this.searchResults = res.data || res;

    });

}
}