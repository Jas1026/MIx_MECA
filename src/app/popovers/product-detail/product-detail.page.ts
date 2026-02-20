import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  @Input() product: any;
  @Input() table: any;

  notes = "";
  r_accompaniments = "";
  quantity = 1;
  price = 0;
  results: any = [];
  delivery = false;
  deliveryPrice = 0;
  accompaniments: any = [];
  constructor(private popoverController: PopoverController, private serverContent: ServerContentService) { }

  ngOnInit() {
    this.serverContent.IsDeliveryTable(this.table.toString()).subscribe(async data => {
      this.results = data;
      this.delivery = (this.results.delivery == "1") ? true : false;
    });
    this.price = this.product.price;
    if (this.product.accompaniment != "") { 
      this.product.accompaniment.split(",").forEach((accompaniment: any) => {
        this.accompaniments.push({ name: accompaniment, selected: false });
      });
    }
  }
  Close() {
    this.popoverController.dismiss();
  }
  DeliveryPrice(ev:any) {
    this.deliveryPrice = ev.detail.value;
  }
  AddProduct() {
    if (this.product.accompaniment != "") {
      this.accompaniments.forEach((accompaniment: { name: string; selected: boolean; }) => {
        if (accompaniment.selected) {
          if (accompaniment.name.indexOf(":") > -1) {
            let name = accompaniment.name.split(":");
            this.r_accompaniments += name[0] + ", ";
            name[1] = name[1].replace("+Bs. ", "");
            console.log(this.delivery);
            if(!this.delivery) {
              this.price = this.price * 1 + parseInt(name[1]) * 1;
            }
          } else {
            this.r_accompaniments += accompaniment.name + ", ";
          }
        }
      });
    }
    if(this.delivery) {
      this.price = (this.deliveryPrice - this.price);
    } else {
      this.price -= this.product.price;
    }
    this.serverContent.RegisterProduct(
      this.table.toString(), 
      this.product.id, 
      this.quantity.toString(), 
      this.notes,
      this.r_accompaniments,
      this.price.toString()
    ).subscribe(async data => {
      console.log("error: ", data);
    });
    this.popoverController.dismiss();
  }
  AddQuantity() {
    this.quantity++;
  }
  RemoveQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  ToggleEspecialPrice(ev: any) {
    if (ev.detail.checked) {
      this.delivery = true;
    } else {
      this.delivery = false;
    }
  }
}
