import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-add-brief-product',
  templateUrl: './add-brief-product.page.html',
  styleUrls: ['./add-brief-product.page.scss'],
})
export class AddBriefProductPage implements OnInit {
  product = "";
  price = 0;
  cocina = "";
  kitchen:any = [];
  constructor(private popoverController: PopoverController, private serverContent: ServerContentService) { }

  ngOnInit() {
    this.serverContent.LoadKitchens().subscribe(async data => {
      this.kitchen = data;
    });
  }
  Close() {
    this.popoverController.dismiss();
  }  
  AddBrief() {
    this.serverContent.AddBriefProduct(this.product, this.price.toString(), this.cocina).subscribe(async data => {
      this.serverContent.LoadBrief().subscribe(async data => {
        this.Close();
      });
    });
  }
  TypeSelected(event: any) {
    this.cocina = event.target.value;
  }

}
