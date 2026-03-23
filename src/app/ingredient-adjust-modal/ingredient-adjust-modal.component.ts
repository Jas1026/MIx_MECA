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

ngOnInit() {
  // 1. Cargar catálogo de ingredientes
  this.server.getIngredients().subscribe((res: any) => {
    if (res.error == 0) this.ingredients = res.data;
  });

  // 2. CARGAR AJUSTES PREVIOS (Para que no aparezca en blanco)
  if (this.detailId) {
    this.server.getExistingAdjustments(this.detailId).subscribe((res: any) => {
      if (res.error == 0 && res.data) {
        this.adjustList = res.data.map((a: any) => ({
          ingredient_id: a.ingredient_id,
          nombre: a.nombre, // Asegúrate de que el PHP devuelva el nombre haciendo un JOIN
          unidad: a.unidad_med,
          qty: a.adjustment_qty
        }));
      }
    });
  }
}
addIngredient() {
  if (!this.selectedIngredient || !this.qty) return;

  // Validación local rápida antes de añadir a la lista visual
  if (this.qty > this.selectedIngredient.stock_act) {
    alert('No hay suficiente stock disponible');
    return;
  }

  this.adjustList.push({
    ingredient_id: this.selectedIngredient.id_ingredients,
    nombre: this.selectedIngredient.nombre,
    unidad: this.selectedIngredient.unidad_med,
    qty: this.qty
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
// Reemplaza el (click) del basurero por: (click)="removeIngredient(item, i)"

removeIngredient(item: any, index: number) {
  // Si el item ya tiene ingredient_id es porque viene de la BD
  if (this.detailId && item.ingredient_id) {
    this.server.deleteAdjustment(this.detailId, item.ingredient_id).subscribe((res: any) => {
      if (res.error === 0) {
        this.adjustList.splice(index, 1); // Lo quitamos de la lista solo si el servidor confirmó
        console.log("Borrado con éxito");
      } else {
        alert("Error al borrar: " + res.message);
      }
    });
  } else {
    // Si es algo que acabas de escribir y aún no guardas, solo lo quitas de la lista
    this.adjustList.splice(index, 1);
  }
}
}