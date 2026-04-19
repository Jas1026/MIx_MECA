import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent implements OnInit {

  @Input() location: any;

  tab: string = 'ingredientes';

  ingredientes: any[] = [];
  botellas: any[] = [];
  productos: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const id = this.location.id_location;
    const system = this.server.getSystem();

    // 🔹 INGREDIENTES
    this.server.getIngredientsByLocation(id, system).subscribe((res:any)=>{
      if(res.error === 0){
        this.ingredientes = res.data;
      }
    });

    // 🔹 BOTELLAS (YA AGRUPADAS DESDE BACK 🔥)
    this.server.getBottlesByLocation(id, system).subscribe((res:any)=>{
      if(res.error === 0){
        this.botellas = res.data;
      }
    });

    // 🔹 PRODUCTOS
    this.server.getProductsByLocation(id, system).subscribe((res:any)=>{
      if(res.error === 0){
        this.productos = res.data;
      }
    });
  }

  cerrar(){
    this.modalCtrl.dismiss();
  }
}