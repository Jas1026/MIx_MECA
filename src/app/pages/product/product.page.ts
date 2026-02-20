import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage {
  tableId = 0;
  productId = 0;
  quantity = 1;
  notes = "";
  name = "";
  product: any = [];
  stateStyle = "product-state product-idle";
  checkStyle = "item-check item-check-idle";
  constructor(private router: Router,
    private route: ActivatedRoute,
    private serverContent: ServerContentService,
    private alertController: AlertController) { }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.productId = params['item']; 
      this.tableId = params['table']; 
    });    
    this.serverContent.LoadProductDetail(this.productId.toString()).subscribe(async data => {
      this.product = data;
      if (this.product[0].state == "sin enviar") {
        this.stateStyle = "product-state product-idle";
      } else if (this.product[0].state == "espera") {
        this.stateStyle = "product-state product-warning";
      } else if (this.product[0].state == "listo") {
        this.stateStyle = "product-state product-ready";
      } else if (this.product[0].state == "devuelto") {
        this.stateStyle = "product-state product-error";
      } else if (this.product[0].state == "entregado") {
        this.stateStyle = "product-state product-ready";
        this.checkStyle = "item-check item-check-ready";
      }
      this.quantity = this.product[0].quantity;
      this.notes = this.product[0].notes;
      this.name = this.product[0].name;
    });
  }
  SaveProduct() {
    this.serverContent.UpdateProduct(this.productId.toString(), this.quantity.toString(), this.notes).subscribe(async data => {
      console.log("error: ", data);
      //back previus page
      this.router.navigate(['table', {item: this.tableId}]);
   });
  }
  async DeleteProduct() {
   const alert = this.alertController.create({
    header: 'ELIMINAR PRODUCTO',
    message: 'Esta acción no se puede revertir.',
    cssClass: 'meca-alert',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'btn-white'
      }, {
        text: 'Eliminar',
        cssClass: 'btn-red',
        handler: () => {
          this.serverContent.DeleteProduct(this.productId.toString()).subscribe(async data => {
            console.log("error: ", data);
            //back previus page
            this.router.navigate(['table', {item: this.tableId}]);
         });
        }
      }]
  });
  (await alert).present();    
}
  AddQuantity() {
    this.quantity++;
  }
  RemoveQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }  
  Delivered(pid:number, state:string) {
    if (state == "listo") {
      this.serverContent.UpdateProductStatus(pid.toString(), "entregado").subscribe(async data => {
        this.router.navigate(['table', {item: this.tableId}]);
      });
    }
  }
}
