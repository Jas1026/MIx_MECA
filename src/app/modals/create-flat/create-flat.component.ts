import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-flat',
  templateUrl: './create-flat.component.html',
  styleUrls: ['./create-flat.component.scss'],
})
export class CreateFlatComponent implements OnInit {
  @Input() flat: any; // Recibe el objeto si es edición

  newFlat = {
    name: '',
    description: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    if (this.flat) {
      this.newFlat.name = this.flat.Name;
      this.newFlat.description = this.flat.Description;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveFlat() {
    if (!this.newFlat.name) {
      this.presentToast('El nombre es obligatorio', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loading.present();

    const system = this.server.getSystem();
    const body = new FormData();
    body.append('name', this.newFlat.name);
    body.append('description', this.newFlat.description);
    body.append('system', system);
    if (this.flat) body.append('id_flat', this.flat.Id_flats);

    this.server.createFlat(body).subscribe({
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