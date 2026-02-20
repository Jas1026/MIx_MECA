import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { ExtraCostPage } from 'src/app/popovers/extra-cost/extra-cost.page';
import { InvoiceDetailPage } from 'src/app/popovers/invoice-detail/invoice-detail.page';
import { SwitchTablePage } from 'src/app/popovers/switch-table/switch-table.page';
import { TicketDetailPage } from 'src/app/popovers/ticket-detail/ticket-detail.page';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.page.html',
  styleUrls: ['./table.page.scss'],
})
export class TablePage{
  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private popoverController: PopoverController,
    private serverContent: ServerContentService,
    private alertController: AlertController) { }
  tableid = 0;
  table: any = [];
  people = 1;
  canUpdate = true;
  id_user = 0;
  ionViewWillEnter(){
    this.id_user = parseInt(localStorage.getItem("user_id") || "0");
    this.canUpdate = true;
    this.route.params.subscribe(params => {
      this.tableid = params['item']; 
    });    
    this.UpdateContent();
    
  }
  ionViewWillLeave(){
    this.canUpdate = false;
  }
  AddProducts(){ 
    this.router.navigate(['categories', {item: this.tableid}]);
  }
  async AddNote(){
    const popover = await this.popoverController.create({
      component: TicketDetailPage,
      componentProps: {pid: this.table[0]["ticket"][0].id, notes: this.table[0]["ticket"][0].notes},

      translucent: true,
    });

    await popover.present();
  }
  SeeProduct(productId: number) {
    this.router.navigate(['product', {item: productId, table: this.tableid}]);
  }  
  Delivered(product: any[]) {
    if (product[0].state == "listo") {
      this.serverContent.UpdateProductStatus(product[0].id.toString(), "entregado").subscribe(async data => {
        this.UpdateContent();
      });
    }
  }
  SendProducts() {
    this.serverContent.SendProductsToKitchen(this.table[0]["ticket"][0].id.toString(), this.tableid.toString(), this.people.toString()).subscribe(async data => {
      this.serverContent.LoadTable(this.tableid.toString()).subscribe(async data => {
        this.table = data;
      });
    });
  }
  UpdateContent() {
    if (!this.canUpdate) {
      return;
    }
    this.serverContent.LoadTable(this.tableid.toString()).subscribe(async data => {
      this.table = data;
    });
    setTimeout(() => {
      this.UpdateContent();      
    }, 5000);
  }
  ClearTable() {
    this.serverContent.ClearTable(this.tableid.toString()).subscribe(async data => {
      console.log("error: ", data);
      this.router.navigate(['dashboard']);
    });
  }
  async SeeInvoice() {
    const popover = await this.popoverController.create({
      component: InvoiceDetailPage,
      translucent: true,
      componentProps: {table: this.table},
    });

    await popover.present();
  }
  SeeTables() {    
    this.router.navigate(['tables']);
  }
  AddQuantity() {
    this.people++;
  }
  RemoveQuantity() {
    if (this.people > 1) {
      this.people--;
    }
  }
  async SwitchTable() {
    const popover = await this.popoverController.create({
      component: SwitchTablePage,
      translucent: true,
      componentProps: {table: this.table},
    });
    await popover.present();
   }
   async AddExtraCost() {
     const popover = await this.popoverController.create({
       component: ExtraCostPage,
       translucent: true,
       componentProps: {table: this.table},
     });
     await popover.present();
    }
  async CloseTable() {
    const alert = this.alertController.create({
      header: 'Clausurar Mesa',
      message: '¿Desea cerrar la mesa? Sólo un administrador podrá abrirla de nuevo',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Clausurar',
          cssClass: 'btn-red',
          handler: () => {
            this.serverContent.CloseTable(this.tableid.toString()).subscribe(async data => {
              this.router.navigate(['tables']);
            });
          }
        }]
      });      
    (await alert).present(); 
  }
  async ReOpenTable() {
    const alertr = this.alertController.create({
      header: 'Abrir Mesa',
      message: '¿Desea abrir la mesa?',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Abrir',
          cssClass: 'btn-yellow',
          handler: () => {
            this.serverContent.OpenTable(this.tableid.toString()).subscribe(async data => {
              this.router.navigate(['tables']);
            });
          }
        }]
      });
    (await alertr).present();
  }
  async UnassignTable() {
    const alert1 = this.alertController.create({
      header: 'Mesa',
      message: 'Desasignarme de esta mesa',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Desasignar',
          cssClass: 'btn-red',
          handler: () => {
            this.ConfirmUnassignTable();
          }
        }]
      });
    (await alert1).present();
  }
  async ConfirmUnassignTable() {
    const alert2 = this.alertController.create({
      header: 'Mesa',
      message: 'Ya no tendrás acceso a la atención de esta mesa. ¿Deseas desvincular esta mesa de todas formas?',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Si, desasignar',
          cssClass: 'btn-red',
          handler: () => {
            this.serverContent.UnassignTable(this.tableid.toString()).subscribe(async data => {
              this.router.navigate(['tables']);
            });
          }
        }]
      });
    (await alert2).present();
  }
  async AssignTable() {
    const alert2 = this.alertController.create({
      header: 'Mesa',
      message: '¿Deseas atender esta mesa?',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Asignar',
          cssClass: 'btn-yellow',
          handler: () => {
            this.serverContent.AssignTable(this.tableid.toString()).subscribe(async data => {
              this.router.navigate(['tables']);
            });
          }
        }]
      });
    (await alert2).present();
  }
  GoNext(page: string) {    
    this.router.navigate([page]);
  }
  GoTableRecord() {    
    this.router.navigate(['table-record', {item: this.tableid}]);
  }

}
