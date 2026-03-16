import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-ingredient-adjust-modal',
  templateUrl: './ingredient-adjust-modal.component.html'
})
export class IngredientAdjustModalComponent {

  @Input() detailId:any;

  ingredients:any[] = [];
  selectedIngredient:any = null;
  qty:number = 0;

  adjustList:any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService
  ){}

  ngOnInit(){

    this.server.getIngredients().subscribe((res:any)=>{

      if(res.error==0){
        this.ingredients = res.data;
      }

    });

  }

  addIngredient(){

    if(!this.selectedIngredient || !this.qty) return;

    this.adjustList.push({

      ingredient_id:this.selectedIngredient.id_ingredients,
      nombre:this.selectedIngredient.nombre,
      unidad:this.selectedIngredient.unidad_med,
      qty:this.qty

    });

    this.qty = 0;

  }

  save(){

    if(this.adjustList.length==0){
      this.close();
      return;
    }

    this.server.saveAdjustments(this.detailId,this.adjustList)
    .subscribe(()=>{

      this.close();

    });

  }

  close(){
    this.modalCtrl.dismiss();
  }

}