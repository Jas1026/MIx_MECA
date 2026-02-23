import { Component } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage {

  segment: string = 'ingredients';

  ingredients: any[] = [];
  products: any[] = [];
  assets: any[] = [];

  nuevoAsset = {
    nombre: '',
    categoria: '',
    stock: 0
  };

  constructor(private server: ServerContentService) {}

  ionViewWillEnter() {
    this.loadIngredients();
    this.loadAssets();
    this.loadProducts();
  }

  segmentChanged() {
    if (this.segment === 'ingredients') this.loadIngredients();
    if (this.segment === 'assets') this.loadAssets();
    if (this.segment === 'products') this.loadProducts();
  }

  /* ---------------- INGREDIENTES ---------------- */

  loadIngredients() {
    this.server.getIngredients().subscribe((res: any) => {
      if (res.error === 0) {
        this.ingredients = res.data;
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
        this.assets = res.data;
      }
    });
  }

  crearAsset() {
    this.server.addAsset(this.nuevoAsset).subscribe((res: any) => {
      if (res.error === 0) {
        this.nuevoAsset = { nombre: '', categoria: '', stock: 0 };
        this.loadAssets();
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

}