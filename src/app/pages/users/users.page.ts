import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';
import { UserFormComponent } from 'src/app/modals/user-form/user-form.component';
import { ConfirmModalComponent } from 'src/app/shared/confirm-modal/confirm-modal.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: any[] = [];
  // 🔎 Filtros
  searchName: string = '';
  selectedRole: string = '';
  selectedState: string = '';

  filteredUsers: any[] = [];
  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  applyFilters() {

  this.filteredUsers = this.users.filter(user => {

    const name = user.name?.toLowerCase() || '';

    const matchName =
      name.includes(this.searchName.toLowerCase());

    // 🔥 AHORA COMPARA CON role (NO role_id)
    const matchRole =
      !this.selectedRole ||
      user.role == this.selectedRole;

    
   // 🔥 FILTRO DE ESTADO CORRECTO
    const matchState =
      this.selectedState === '' ||
      String(user.state) == String(this.selectedState);

    return matchName && matchRole && matchState;
  });

}

  clearFilters() {

    this.searchName = '';
    this.selectedRole = '';
    this.selectedState = '';

    this.filteredUsers = this.users;

  }


  loadUsers() {
    this.server.LoadUsers().subscribe({
      next: (res: any) => {
        if (res.error === 0) {
          this.users = res.data;
          this.filteredUsers = res.data;
          
        }
      },
      error: (err) => {
        console.log("Error:", err);
      }
    });
  }

  async addUser() {
    const modal = await this.modalCtrl.create({
      component: UserFormComponent
    });

    modal.onDidDismiss().then(res => {
      if (res.data) {
        console.log('Nuevo usuario:', res.data);
        this.loadUsers();
      }
    });

    await modal.present();
  }

  async editUser(user: any) {
    const modal = await this.modalCtrl.create({
      component: UserFormComponent,
      componentProps: { user }
    });

    await modal.present();
  }

  async openConfirmModal(user: any) {

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      componentProps: {
        title: 'Inactivar Usuario',
        message: '¿Estás seguro que deseas inactivar este usuario?'
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data === true) {
      this.inactivateUser(user.id);
    }
  }

inactivateUser(id: number) {

  this.http.post('http://localhost/api/inactivar_usuario.php', {
    id: id
  }).subscribe({
    next: (res: any) => {

      console.log('Usuario inactivado:', res);

      // 🔥 RECARGAR Y REAPLICAR FILTROS
      this.server.LoadUsers().subscribe({
        next: (response: any) => {
          if (response.error === 0) {
            this.users = response.data;
            this.applyFilters(); // 👈 IMPORTANTE
          }
        }
      });

    },
    error: (err) => {
      console.error('Error al inactivar:', err);
    }
  });

}


toggleState(user: any) {

  const nuevoEstado = user.state == 1 ? 0 : 1;

  this.server.updateUserState(user.id, nuevoEstado).subscribe({
    next: (res: any) => {

      if (res.error === 0) {

        // Cambiar visualmente
        user.state = nuevoEstado;

        console.log("Estado actualizado correctamente");

      } else {
        console.error("Error al actualizar estado");
      }

    },
    error: (err) => {
      console.error("Error:", err);
    }
  });

}
}