import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-view-product-detail',
  templateUrl: './view-product-detail.component.html',
  styleUrls: ['./view-product-detail.component.scss'],
})
export class ViewProductDetailComponent implements OnInit {
  @Input() product: any; // Recibe el objeto producto desde la lista

  ingredients: any[] = [];
  kitchens: any[] = [];
  isLoading = true;

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService
  ) {}

  ngOnInit() {
    this.loadAllDetails();
  }

  async loadAllDetails() {
    this.isLoading = true;
    const id = this.product.id_product;

    // Cargamos receta y cocinas en paralelo
    this.server.getProductRecipe(id).subscribe((res: any) => {
      this.ingredients = res.data || [];
      this.checkLoading();
    });

    this.server.getProductKitchens(id).subscribe((res: any) => {
      // Filtramos los nombres de las cocinas si es necesario
      this.kitchens = res.data || [];
      this.checkLoading();
    });
  }

  checkLoading() {
    // Podrías mejorar esto con un forkJoin, pero para simplicidad:
    this.isLoading = false;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}