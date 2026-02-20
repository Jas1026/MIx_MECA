import { Component,EventEmitter,Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent  implements OnInit {
  @Input() product:any;
  @Output() seeProduct= new EventEmitter<number>();
  @Output() checkProduct= new EventEmitter<any>();
  productStyle = "item-status item-idle";
  checkStyle = "item-check item-check-idle";
  @ViewChild(IonItemSliding) slidingItem?: IonItemSliding;
  constructor(private serverContent: ServerContentService) { }

  ngOnInit() {
    if (this.product.state == "sin enviar") {
      this.productStyle = "item-status item-idle";
    } else if (this.product.state == "espera") {
      this.productStyle = "item-status item-waiting";
    } else if (this.product.state == "preparando") {
      this.productStyle = "item-status item-viewed";
    } else if (this.product.state == "listo" ) {
      this.productStyle = "item-status item-ready";
    } else if (this.product.state == "devuelto") {
      this.productStyle = "item-status item-error";
    } else if (this.product.state == "entregado") {
      this.productStyle = "item-status item-ready";      
      this.checkStyle = "item-check item-check-ready";
    }
  }
  SeeProduct(){
    this.seeProduct.emit(this.product.id);
  }
  AlertProduct(pid:number) {
    this.slidingItem?.closeOpened();
    this.serverContent.AlertProduct(pid.toString()).subscribe(async data => {
      console.log(data);
    });
  }
  CheckProduct(){
    let prod : any = [];
    prod.push({id: this.product.id, state: this.product.state});
    console.log(prod);
    this.checkProduct.emit(prod);
  }
  ItemTimer() {
    let time = new Date(this.product.sent_at);
    time.setHours(time.getHours());
    let now = new Date();
    let diff = now.getTime() - time.getTime();
    let minutes = Math.floor(diff / 60000);
    let seconds = Math.floor((diff - minutes * 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
}
