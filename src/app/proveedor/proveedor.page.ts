import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateProveedorComponent } from '../modals/create-proveedor/create-proveedor.component';
import { ViewProveedorComponent } from '../modals/view-proveedor/view-proveedor.component';
@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.page.html',
  styleUrls: ['./proveedor.page.scss'],
})
export class ProveedorPage implements OnInit {
 proveedor: any[] = [];
  filterNombre: string = '';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarProveedor();
  }

  cargarProveedor() {
    const system = this.server.getSystem();
    this.server.getProveedor(system).subscribe((res: any) => {
      this.proveedor = res;
    });
  }

  get filteredProveedor() {
    return this.proveedor.filter(f => 
      f.nombre_empresa.toLowerCase().includes(this.filterNombre.toLowerCase())
    );
  }

  async openCreateModal(proveedor?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateProveedorComponent,
      componentProps: { proveedor }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarProveedor();
    });

    return await modal.present();
  }
async toggleProvState(proveedor: any) {

  const nuevoEstado =
    proveedor.estado == 'Activo'
      ? 'Inactivo'
      : 'Activo';

  const system = this.server.getSystem();

  let body = new FormData();

  body.append(
    "id_proveedor",
    proveedor.id_proveedor
  );

  body.append(
    "estado",
    nuevoEstado
  );

  body.append(
    "system",
    system
  );

  this.server.updateProveedorState(body)
    .subscribe((res: any) => {

      if (res.error === 0) {

        proveedor.estado = nuevoEstado;

        this.presentToast(
          "Estado actualizado",
          "success"
        );

      } else {

        this.presentToast(
          "Error al cambiar estado",
          "danger"
        );
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
async openViewModal(proveedor: any) {

  const modal = await this.modalCtrl.create({

    component: ViewProveedorComponent,

    componentProps: {
      proveedor
    }

  });

  return await modal.present();
}
}
