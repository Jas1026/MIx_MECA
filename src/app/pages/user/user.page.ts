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

  let resultado = [...this.users];

  resultado = resultado.filter(u => {

    const matchNombre =
      !this.filterName ||
      u.name?.toLowerCase().includes(this.filterName.toLowerCase());

    const matchRol =
      this.selectedRole === 'all' ||
      u.role === this.selectedRole;

    const filtroNombre =
      !this.filtros.name ||
      u.name?.toLowerCase().includes(this.filtros.name.toLowerCase());

    const filtroRol =
      !this.filtros.role ||
      u.role?.toLowerCase().includes(this.filtros.role.toLowerCase());

    const filtroCode =
      !this.filtros.code ||
      u.code?.toLowerCase().includes(this.filtros.code.toLowerCase());

    const estadoTexto =
      (u.state == 1 || u.state == '1')
        ? 'activo'
        : 'inactivo';

    const filtroEstado =
      !this.filtros.state ||
      estadoTexto.includes(this.filtros.state.toLowerCase());

    return (
      matchNombre &&
      matchRol &&
      filtroNombre &&
      filtroRol &&
      filtroCode &&
      filtroEstado
    );

  });

  // ORDENAMIENTO

  if (this.sortColumn) {

    resultado.sort((a: any, b: any) => {

      let valorA = a[this.sortColumn];
      let valorB = b[this.sortColumn];

      valorA = valorA?.toString().toLowerCase() || '';
      valorB = valorB?.toString().toLowerCase() || '';

      if (valorA < valorB)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (valorA > valorB)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;

    });

  }

  return resultado;

}
get totalPaginas(): number {

  return Math.ceil(
    this.filteredUsers.length / this.itemsPorPagina
  ) || 1;

}

get usuariosPaginados() {

  const inicio =
    (this.paginaActual - 1) * this.itemsPorPagina;

  return this.filteredUsers.slice(
    inicio,
    inicio + this.itemsPorPagina
  );

}
paginaAnterior() {

  if (this.paginaActual > 1) {
    this.paginaActual--;
  }

}

paginaSiguiente() {

  if (this.paginaActual < this.totalPaginas) {
    this.paginaActual++;
  }

}
limpiarTodosFiltros() {

  this.filterName = '';

  this.selectedRole = 'all';

  this.filtros = {
    name: '',
    role: '',
    code: '',
    state: ''
  };

  this.sortColumn = '';
  this.sortDirection = 'asc';

  this.paginaActual = 1;

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
// ORDENAMIENTO
sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

// FILTROS POR COLUMNA
filtros = {
  name: '',
  role: '',
  code: '',
  state: ''
};

// PAGINACIÓN
paginaActual = 1;

itemsPorPagina = 10;

opcionesPagina = [5, 10, 20, 50];
ordenar(columna: string) {

  if (this.sortColumn === columna) {

    this.sortDirection =
      this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

  } else {

    this.sortColumn = columna;
    this.sortDirection = 'asc';

  }

}
async eliminarUsuario(user:any){

  const body = new FormData();

  body.append("id", user.id);

  body.append(

    "system",

    this.server.getSystem()

  );

  this.server.deleteUser(body)

  .subscribe({

    next:(res:any)=>{

      if(res.error==0){

        this.presentToast(

          "Usuario eliminado",

          "success"

        );

        // refrescar tabla

        this.cargarUsers();

      }

      else{

        this.presentToast(

          res.message,

          "danger"

        );

      }

    },

    error:()=>{

      this.presentToast(

        "Error servidor",

        "danger"

      );

    }

  });

}
}