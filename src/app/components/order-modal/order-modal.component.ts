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

  @Input() table: any;

  categories: any[] = [];
  products: any[] = [];
  cart: any[] = [];

  selectedCategory: string = '';
viewMode: 'categories' | 'products' = 'categories';
currentCategoryName: string = '';
  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadCategories();
  }
  loadCategories() {
  this.server.getCategories().subscribe((res: any) => {
    this.categories = res.data || res;
  });
}
selectCategory(cat: any) {

  console.log("Categoria enviada:", cat);

  this.currentCategoryName = cat.name;

  this.viewMode = 'products'; // 👈 ESTO ES CLAVE

  this.server.getProductsByCategory(cat.id)
    .subscribe((res: any) => {

      console.log("Productos recibidos:", res);

      this.products = res.data || res;

    });
}
goBack() {
  this.viewMode = 'categories';
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
        quantity: 1
      });
    }
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

    if (this.cart.length === 0) {
      alert("Agrega productos primero");
      return;
    }

    const id_user = localStorage.getItem("user_id") || '';

    this.server.createOrder(this.table.id_table, id_user, this.cart)
      .subscribe((res: any) => {

        if (res.error === 0) {
          alert("Pedido creado");
          this.modalCtrl.dismiss(true);
        } else {
          alert("Error creando pedido");
        }

      });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}