import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateFlatComponent } from '../../modals/create-flat/create-flat.component';

@Component({
  selector: 'app-flats',
  templateUrl: './flats.page.html',
  styleUrls: ['./flats.page.scss'],
})
export class FlatsPage implements OnInit {
  flats: any[] = [];
  filterNombre: string = '';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarFlats();
  }

  cargarFlats() {
    const system = this.server.getSystem();
    this.server.getFlatsCom(system).subscribe((res: any) => {
      this.flats = res;
    });
  }

  get filteredFlats() {
    return this.flats.filter(f => 
      f.Name.toLowerCase().includes(this.filterNombre.toLowerCase())
    );
  }

  async openCreateModal(flat?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateFlatComponent,
      componentProps: { flat: flat }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarFlats();
    });

    return await modal.present();
  }

  async toggleFlatState(flat: any) {
    const nuevoEstado = flat.state == 1 ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id_flat", flat.Id_flats);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateFlatState(body).subscribe((res: any) => {
      if (res.error === 0) {
        flat.state = nuevoEstado;
        this.presentToast("Estado actualizado", "success");
      } else {
        this.presentToast("Error al cambiar estado", "danger");
      }
    });
  }

  // 👇 ESTA ES LA FUNCIÓN QUE FALTABA
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