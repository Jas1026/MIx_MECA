import { Component, Input, OnInit } from '@angular/core';
import {
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular';

import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-proveedor',
  templateUrl: './create-proveedor.component.html',
  styleUrls: ['./create-proveedor.component.scss'],
})
export class CreateProveedorComponent implements OnInit {

  @Input() proveedor: any;

  newProveedor = {

    nombre_empresa: '',
    nit: '',
    rubro: '',

    nombre_contacto: '',
    cargo_contacto: '',

    telefono: '',
    telefono_secundario: '',
    correo: '',

    direccion: '',
    ciudad: '',

    banco: '',
    numero_cuenta: '',
    tipo_cuenta: 'Cuenta corriente',
    titular_cuenta: '',

    tiempo_entrega_dias: 1,
    nivel_concurrencia: 'Media',

    horario_atencion: '',
    dia_usual_visita: '',

    comentarios: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {

    if (this.proveedor) {

      this.newProveedor = {

        nombre_empresa: this.proveedor.nombre_empresa || '',
        nit: this.proveedor.nit || '',
        rubro: this.proveedor.rubro || '',

        nombre_contacto: this.proveedor.nombre_contacto || '',
        cargo_contacto: this.proveedor.cargo_contacto || '',

        telefono: this.proveedor.telefono || '',
        telefono_secundario: this.proveedor.telefono_secundario || '',
        correo: this.proveedor.correo || '',

        direccion: this.proveedor.direccion || '',
        ciudad: this.proveedor.ciudad || '',

        banco: this.proveedor.banco || '',
        numero_cuenta: this.proveedor.numero_cuenta || '',
        tipo_cuenta: this.proveedor.tipo_cuenta || 'Cuenta corriente',
        titular_cuenta: this.proveedor.titular_cuenta || '',

        tiempo_entrega_dias: this.proveedor.tiempo_entrega_dias || 1,
        nivel_concurrencia: this.proveedor.nivel_concurrencia || 'Media',

        horario_atencion: this.proveedor.horario_atencion || '',
        dia_usual_visita: this.proveedor.dia_usual_visita || '',

        comentarios: this.proveedor.comentarios || ''
      };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveProveedor() {

    if (!this.newProveedor.nombre_empresa) {

      this.presentToast(
        'El nombre de la empresa es obligatorio',
        'warning'
      );

      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Procesando...'
    });

    await loading.present();

    const system = this.server.getSystem();

    const body = new FormData();

    Object.entries(this.newProveedor).forEach(([key, value]) => {
      body.append(key, String(value));
    });

    body.append('system', system);

    if (this.proveedor) {
      body.append(
        'id_proveedor',
        this.proveedor.id_proveedor
      );
    }

    this.server.createProveedor(body).subscribe({

      next: async (res: any) => {

        await loading.dismiss();

        if (res.error === 0) {

          this.presentToast(
            'Proveedor guardado con éxito',
            'success'
          );

          this.modalCtrl.dismiss(true);

        } else {

          this.presentToast(
            res.message,
            'danger'
          );
        }
      },

      error: async () => {

        await loading.dismiss();

        this.presentToast(
          'Error de servidor',
          'danger'
        );
      }
    });
  }

  async presentToast(
    message: string,
    color: string
  ) {

    const toast = await this.toastCtrl.create({

      message,
      color,
      duration: 2000

    });

    toast.present();
  }
}