import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-loan-manager',
  templateUrl: './loan-manager.component.html'
})
export class LoanManagerComponent implements OnInit {
  @Input() type: 'ingredient' | 'product' = 'ingredient';
  
  targetSystem: string = '';
  currentSystem: string = '';
  externalItems: any[] = [];
  selectedItems: any[] = [];
  loading: boolean = false;

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.currentSystem = this.server.getSystem();
    // Definir el sistema contrario
    this.targetSystem = (this.currentSystem === 'mixtura') ? 'mecapos' : 'mixtura';
    this.loadExternalData();
  }
loadExternalData() {
  this.loading = true;
  const request = (this.type === 'ingredient') 
    ? this.server.getExternalIngredients(this.targetSystem)
    : this.server.getProductsExternal(this.targetSystem); 

  request.subscribe((res: any) => {
    if (res.error === 0) {
      this.externalItems = res.data.map((item: any) => ({
        ...item,
        // Normalizamos los nombres de las propiedades para el HTML
        displayName: item.nombre || item.nombre_producto,
        displayStock: (this.type === 'ingredient') ? item.stock_act : item.stock_disponible,
        transfer_qty: 0 
      }));
    }
    this.loading = false;
  });
}
confirmTransfer() {
  const toTransfer = this.externalItems.filter(i => i.transfer_qty > 0);
  
  if (toTransfer.length === 0) return;

  // Validación de stock
  for (let item of toTransfer) {
    let stockDisponible = (this.type === 'ingredient') ? item.stock_act : item.stock_disponible;
    if (item.transfer_qty > stockDisponible) {
      alert(`Stock insuficiente en ${this.targetSystem} para ${item.nombre || item.nombre_producto}`);
      return;
    }
  }

  this.server.transferStockByNames({
    from_system: this.targetSystem,
    to_system: this.currentSystem,
    type: this.type,
    items: toTransfer.map(i => ({
      nombre: i.nombre || i.nombre_producto, // Enviamos el nombre para hacer match seguro
      qty: i.transfer_qty
    }))
  }).subscribe((res: any) => {
    if (res.error === 0) {
      this.modalCtrl.dismiss(true);
    } else {
      alert("Error: " + res.message);
    }
  });
}

  close() { this.modalCtrl.dismiss(); }
}