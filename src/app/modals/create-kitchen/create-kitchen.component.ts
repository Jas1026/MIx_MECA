import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-kitchen',
  templateUrl: './create-kitchen.component.html',
  styleUrls: ['./create-kitchen.component.scss'],
})
export class CreateKitchenComponent  implements OnInit {

  @Input() kitchen: any; 

  newKitchen = {
    name: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    if (this.kitchen) {
      this.newKitchen.name = this.kitchen.name;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveKitchen() {
    if (!this.newKitchen.name) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loading.present();

    const system = this.server.getSystem();
    const body = new FormData();
    body.append('name', this.newKitchen.name);
    body.append('system', system);
    if (this.kitchen) body.append('id_flat', this.kitchen.id);

    this.server.createKitchen(body).subscribe({
      next: (res: any) => {
        loading.dismiss();
        if (res.error === 0) {
          this.presentToast('¡Éxito!', 'success');
          this.modalCtrl.dismiss(true);
        }
      },
      error: () => {
        loading.dismiss();
        this.presentToast('Error de servidor', 'danger');
      }
    });
  }

  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000 });
    t.present();
  }

}
