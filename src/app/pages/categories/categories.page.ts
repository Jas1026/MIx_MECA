import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { ProductDetailPage } from 'src/app/popovers/product-detail/product-detail.page';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {
  tableid = 0;
  search="";
  categories: any = [];
  products: any = [];
  showCategories = true;
  constructor(private router:Router, 
    private route: ActivatedRoute, 
    private serverContent: ServerContentService,
    private popoverController: PopoverController) { }

  ionViewWillEnter(){
    this.route.params.subscribe(params => {
      this.tableid = params['item']; 
    });
    this.serverContent.LoadCategories(this.tableid).subscribe(async data => {
      this.categories = data;
      this.categories.forEach((category: { id: number, products: any }) => {
        category.products.forEach((product: { state: string }) => {
          this.products.push(product);
        });
      });
    });
  }
  SeeProducts(category: number, nameCat: string){
    this.router.navigate(['products', {item: this.tableid, cat: category, name: nameCat}]);
  }
  Search(ev:any) {
    this.search = ev.target.value;
    if (this.search == "") {
      this.showCategories = true;
    } else {
      this.showCategories = false;
    }
    //search in products
    this.products.forEach((product: { name: string, state: string }) => {
      if (product.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) {
        product.state = "si";
      } else {
        product.state = "no";
      }
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
