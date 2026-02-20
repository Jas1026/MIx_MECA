import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { ProductDetailPage } from 'src/app/popovers/product-detail/product-detail.page';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage {
  tableid = 0;
  catId = 0;
  catName = "";
  products: any = [];
  constructor(
    private popoverController: PopoverController,
    private route: ActivatedRoute,
    private serverContent: ServerContentService) { }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.tableid = params['item']; 
      this.catId = params['cat']; 
      this.catName = params['name']; 
    });    
    this.serverContent.LoadProducts(this.catId.toString()).subscribe(async data => {
      this.products = data;
    });
  }
  async AddProduct(ev: any, prod: any) {
    const popover = await this.popoverController.create({
      component: ProductDetailPage,
      translucent: true,
      componentProps: {product: prod, table: this.tableid},
    });

    await popover.present();
  }
}
