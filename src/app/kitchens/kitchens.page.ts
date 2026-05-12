import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateKitchenComponent } from '../modals/create-kitchen/create-kitchen.component';

@Component({
  selector: 'app-kitchens',
  templateUrl: './kitchens.page.html',
  styleUrls: ['./kitchens.page.scss'],
})
export class KitchensPage implements OnInit {
  kitchens: any[] = [];
  filterNombre: string = '';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarKitchens();
  }

  cargarKitchens() {
    const system = this.server.getSystem();
    this.server.getKitchensCom(system).subscribe((res: any) => {
      this.kitchens = res;
    });
  }

  get filteredKitchens() {
    return this.kitchens.filter(f => 
      f.name.toLowerCase().includes(this.filterNombre.toLowerCase())
    );
  }

  async openCreateModal(kitchen?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateKitchenComponent,
      componentProps: { kitchen: kitchen }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarKitchens();
    });

    return await modal.present();
  }

  async toggleFlatState(kitchen: any) {
    const nuevoEstado = kitchen.active == 1 ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id_flat", kitchen.id);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateKitchenState(body).subscribe((res: any) => {
      if (res.error === 0) {
        kitchen.state = nuevoEstado;
        this.presentToast("Estado actualizado", "success");
      } else {
        this.presentToast("Error al cambiar estado", "danger");
      }
    });
  }
  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
