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

  let data = [...this.flats];

  if (this.filterNombre) {

    data = data.filter(f =>
      f.Name?.toLowerCase()
      .includes(this.filterNombre.toLowerCase())
    );

  }

  data = data.filter(f => {

    const estadoTexto =
      f.state == 1
      ? 'activo'
      : 'inactivo';

    return (

      (!this.filtros.Name ||
        f.Name?.toLowerCase()
        .includes(this.filtros.Name.toLowerCase()))

      &&

      (!this.filtros.Description ||
        (f.Description || '')
        .toLowerCase()
        .includes(this.filtros.Description.toLowerCase()))

      &&

      (!this.filtros.state ||
        estadoTexto.includes(
          this.filtros.state.toLowerCase()
        ))

    );

  });

  if (this.sortColumn) {

    data.sort((a: any, b: any) => {

      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();

      if (valA < valB)
        return this.sortDirection === 'asc'
          ? -1
          : 1;

      if (valA > valB)
        return this.sortDirection === 'asc'
          ? 1
          : -1;

      return 0;

    });

  }

  return data;

}
get totalPaginas() {

  return Math.ceil(
    this.filteredFlats.length /
    this.itemsPorPagina
  ) || 1;

}
get flatsPaginados() {

  const inicio =
    (this.paginaActual - 1)
    * this.itemsPorPagina;

  return this.filteredFlats.slice(
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
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

filtros = {
  Name: '',
  Description: '',
  state: ''
};

paginaActual = 1;

itemsPorPagina = 10;

opcionesPagina = [5, 10, 30, 50];
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
limpiarTodosFiltros() {

  this.filterNombre = '';

  this.filtros = {
    Name: '',
    Description: '',
    state: ''
  };

  this.sortColumn = '';
  this.sortDirection = 'asc';

  this.paginaActual = 1;

}
async confirmarEliminar(flat:any){

  const alert = await this.alertCtrl.create({

    header:'Eliminar piso',

    message:
    `¿Deseas eliminar "${flat.Name}"?`,

    buttons:[

      {

        text:'Cancelar',

        role:'cancel'

      },

      {

        text:'Eliminar',

        role:'destructive',

        handler:()=>{

          this.eliminarFlat(flat);

        }

      }

    ]

  });

  await alert.present();

}
eliminarFlat(flat:any){

  const body = new FormData();

  body.append(

    "id_flat",

    flat.Id_flats

  );

  body.append(

    "system",

    this.server.getSystem()

  );

  this.server

  .deleteFlat(body)

  .subscribe({

    next:(res:any)=>{

      if(res.error==0){

        this.presentToast(

          "Piso eliminado",

          "success"

        );

        this.cargarFlats();

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

        "Error del servidor",

        "danger"

      );

    }

  });

}
}