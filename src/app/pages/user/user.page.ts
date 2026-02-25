import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateUserComponent } from '../../modals/create-user/create-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UsersPage implements OnInit {
  users: any[] = [];
  filterName: string = '';
  selectedRole: string = 'all';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarUsers();
  }

  cargarUsers() {
    const system = this.server.getSystem();
    this.server.getUsers(system).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.users = res;
      } else {
        this.users = [];
      }
    });
  }

  get filteredUsers() {
    if (!this.users || !Array.isArray(this.users)) return [];
    return this.users.filter(u => {
      const matchName = u.name.toLowerCase().includes(this.filterName.toLowerCase());
      const matchRole = (this.selectedRole === 'all') || (u.role === this.selectedRole);
      return matchName && matchRole;
    });
  }

  async openCreateModal(user?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateUserComponent,
      componentProps: { user: user }
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarUsers();
    });
    return await modal.present();
  }


  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000 });
    t.present();
  }
  async toggleUserState(user: any) {
  // 1. Calculamos el nuevo estado localmente
  const nuevoEstado = (user.state == 1 || user.state == '1') ? 0 : 1;
  const system = this.server.getSystem();
  
  // 2. Preparamos el cuerpo de la petición
  let body = new FormData();
  body.append("id", user.id);
  body.append("state", nuevoEstado.toString());
  body.append("system", system);

  // 3. Llamamos al servicio
  this.server.updateUserState(body).subscribe({
    next: (res: any) => {
      if (res.error === 0) {
        // 4. Actualizamos la vista solo si el servidor confirmó el cambio
        user.state = nuevoEstado;
        this.presentToast("Estado del usuario actualizado", "success");
      } else {
        this.presentToast("Error: " + res.message, "danger");
      }
    },
    error: (err) => {
      this.presentToast("No se pudo conectar con el servidor", "danger");
    }
  });
}
}