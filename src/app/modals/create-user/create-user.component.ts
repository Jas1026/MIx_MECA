import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {
  @Input() user: any; // Recibe el usuario si es edición

  newUser = {
    name: '',
    role: '',
    code: '',
    password: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    // Si recibimos un usuario, cargamos sus datos para editar
    if (this.user) {
      this.newUser.name = this.user.name;
      this.newUser.role = this.user.role;
      this.newUser.code = this.user.code;
      // La contraseña se deja vacía por seguridad al editar
      this.newUser.password = ''; 
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async saveUser() {
    // Validaciones básicas
    if (!this.newUser.name || !this.newUser.role || !this.newUser.code) {
      this.presentToast('Todos los campos son obligatorios', 'warning');
      return;
    }

    // Si es un usuario nuevo, la contraseña es obligatoria
    if (!this.user && !this.newUser.password) {
      this.presentToast('La contraseña es obligatoria para nuevos usuarios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const system = this.server.getSystem();
    const body = new FormData();
    body.append('name', this.newUser.name);
    body.append('role', this.newUser.role);
    body.append('code', this.newUser.code);
    body.append('password', this.newUser.password);
    body.append('system', system);

    // Si estamos editando, enviamos el ID para que el PHP haga UPDATE
    if (this.user) {
      body.append('id', this.user.id);
    }

    this.server.createUser(body).subscribe({
      next: (res: any) => {
        loading.dismiss();
        if (res.error === 0) {
          this.presentToast('¡Usuario guardado con éxito!', 'success');
          this.modalCtrl.dismiss(true);
        } else {
          this.presentToast('Error: ' + res.message, 'danger');
        }
      },
      error: (err) => {
        loading.dismiss();
        this.presentToast('Error de conexión con el servidor', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}