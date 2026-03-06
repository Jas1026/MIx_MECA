import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { ServerContentService } from '../../services/server-content.service';

@Component({
  selector: 'app-area-detalle-modal',
  templateUrl: './area-detalle-modal.page.html',
})
export class AreaDetalleModalPage implements OnInit {

  @Input() area: any;

  mesas: any[] = [];
  mejorMesa: any = null;
  cargando: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    if (this.area) {
      this.cargarDetalle();
    }
  }

  async cargarDetalle() {

    this.cargando = true;

    const loading = await this.loadingCtrl.create({
      message: 'Cargando detalle...',
      spinner: 'crescent'
    });

    await loading.present();

    const system = this.server.getSystem();

    this.server.getDetalleArea(system, this.area.area)
      .subscribe({

        next: async (res: any) => {

          await loading.dismiss();
          this.cargando = false;

          if (res.error === 0) {

            this.mesas = res.mesas || [];
            this.mejorMesa = res.mejor_mesa || null;

          } else {
            this.mostrarError('No se pudo cargar la información.');
          }

        },

        error: async (err) => {

          await loading.dismiss();
          this.cargando = false;

          console.error(err);
          this.mostrarError('Error de conexión con el servidor.');

        }

      });
  }

  async mostrarError(mensaje: string) {

    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }

}