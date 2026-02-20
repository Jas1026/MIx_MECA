import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.page.html',
  styleUrls: ['./invoice-detail.page.scss'],
})
export class InvoiceDetailPage implements OnInit {
  @Input() table: any;
  payReady = false;
  totalPrice = 0.00;
  quantity = 1;
  efectivo = 0.00;
  vuelto = 0.00;
  tarjeta = 0.00;
  qr = 0.00;
  debe = 0.00;
  products: any = [];
  quantities: any = [];
  prices: any = [];
  subTotalPrices: any = [];
  modifyPrices: any = [];
  maxQuantities: any = [];
  productsToPay: any = [];
  wrongTotal = false;
  emptyPayment = false;
  constructor(private popoverController: PopoverController, private serverContent:ServerContentService) { }

  ngOnInit() {
    this.products = this.table[0].products;
    this.products.forEach((product: { id: number;  quantity: number; price: number; modify_price: number }) => {
      this.quantities[product.id] =  product.quantity;
      this.maxQuantities[product.id] =  product.quantity;
      this.prices[product.id] =  product.price;
      this.modifyPrices[product.id] = product.modify_price;
      this.subTotalPrices[product.id] =  0;
    });
    console.log(this.products);
  }

  Close() {
    this.popoverController.dismiss();
  }
  AddQuantity(id:number) {
    if (this.quantities[id] < this.maxQuantities[id]) {
      this.quantities[id]++;
      if (this.subTotalPrices[id] != 0) {
        this.totalPrice -= this.subTotalPrices[id];
        this.subTotalPrices[id] = (this.prices[id] * 1 + this.modifyPrices[id] * 1) * this.quantities[id];
        this.totalPrice += this.subTotalPrices[id];
      }
    }
  }
  RemoveQuantity(id:number) {
    if (this.quantities[id] > 1) {
      this.quantities[id]--;
      if (this.subTotalPrices[id] != 0) {
        this.totalPrice -= this.subTotalPrices[id];
        this.subTotalPrices[id] = (this.prices[id] * 1 + this.modifyPrices[id] * 1) * this.quantities[id];
        this.totalPrice += this.subTotalPrices[id];
      }
    }
  }
  CalculatePrice(ev:any, id:number) {
    if (ev.detail.checked) {
      this.subTotalPrices[id] = (this.prices[id] * 1 + this.modifyPrices[id] * 1) * this.quantities[id];
      this.totalPrice += this.subTotalPrices[id];
      this.productsToPay.push(id);
    } else {
      this.totalPrice -= this.subTotalPrices[id];
      this.subTotalPrices[id] = 0;
      this.productsToPay.splice(this.productsToPay.indexOf(id), 1);
    }
  }
  Pay() {
    if (!this.payReady) {
      this.payReady = true;
    } else {
      if (this.efectivo == 0 && this.tarjeta == 0 && this.qr == 0 && this.debe == 0) {
        this.emptyPayment = true;
        return;
      }
      this.emptyPayment = false;
      if (this.totalPrice != this.efectivo * 1 + this.tarjeta * 1 + this.qr * 1 + this.debe * 1) {
        this.wrongTotal = true;
        return;
      }
      this.wrongTotal = false;

      let quantitiesToPay = "";
      let subTotalToPay = "";
      this.productsToPay.forEach((product: number) => {
        quantitiesToPay += this.quantities[product] + ",";
        subTotalToPay += this.subTotalPrices[product] + ",";
      });
      //remove last comma
      quantitiesToPay = quantitiesToPay.substring(0, quantitiesToPay.length - 1);
      subTotalToPay = subTotalToPay.substring(0, subTotalToPay.length - 1);
      this.serverContent.CreateInvoice(
        this.products[0].id_ticket.toString(),
        this.totalPrice.toString(),
        this.efectivo.toString(),
        this.tarjeta.toString(),
        this.qr.toString(),
        this.debe.toString(),
        this.productsToPay.toString(),
        quantitiesToPay,
        subTotalToPay
      ).subscribe(async data => {
        console.log("error: ", data);
        this.popoverController.dismiss();
      });
    }
  }
  DivideAmount(cashType:string) {
    if (cashType == "efectivo") {
      if (this.efectivo > this.totalPrice) {
        this.vuelto = (this.totalPrice - this.efectivo) * -1;
      } else {
        this.vuelto = 0;
      }
    }
    
  }
}
