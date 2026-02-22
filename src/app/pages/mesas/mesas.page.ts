import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.page.html',
  styleUrls: ['./mesas.page.scss'],
})
export class MesasPage implements OnInit {

  tables: any[] = [];
  flatId: string = '';

constructor(
  private route: ActivatedRoute,
  private server: ServerContentService,
  private modalCtrl: ModalController,
  private router: Router,
) {}

ngOnInit() {

  this.route.paramMap.subscribe(params => {

    this.flatId = params.get('id') || '';
    console.log("Flat recibido:", this.flatId);

    this.loadTables();

  });

}
loadTables() {

  const system = localStorage.getItem("system") || '';

  this.server.getTables(system, this.flatId)
    .subscribe((res: any) => {

      console.log("Respuesta mesas:", res);

      if (res.error === 0) {
        this.tables = res.data;
      }

    });

}
async openOrderModal(table: any) {

  const modal = await this.modalCtrl.create({
    component: OrderModalComponent,
    componentProps: {
      table: table
    }
  });

  await modal.present();
}
irFacturacion(orderId: number) {
  this.router.navigate(['/facturacion', orderId]);
}
}