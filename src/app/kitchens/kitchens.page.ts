import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateKitchenComponent } from '../modals/create-kitchen/create-kitchen.component';

@Component({
  selector: 'app-kitchens',
  templateUrl: './kitchens.page.html',
  styleUrls: ['./kitchens.page.scss'],
})
export class KitchensPage implements OnInit {
  kitchens: any[] = [];
  filterNombre: string = '';

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarKitchens();
  }

  cargarKitchens() {
    const system = this.server.getSystem();
    this.server.getKitchensCom(system).subscribe((res: any) => {
      this.kitchens = res;
    });
  }

get filteredKitchens() {

  let data = [...this.kitchens];

  data = data.filter(k => {

    const nombre =
      !this.filtros.name ||
      k.name?.toLowerCase().includes(this.filtros.name.toLowerCase());

    const estado =
      !this.filtros.active ||
      (this.filtros.active.toLowerCase() === 'activo'
        ? k.active == 1
        : k.active == 0);

    return nombre && estado;
  });

  if (this.sortColumn) {

    data.sort((a, b) => {

      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];

      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      valueA = valueA.toString().toLowerCase();
      valueB = valueB.toString().toLowerCase();

      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      }

      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;

    });

  }

  return data;
}
get kitchensPaginadas() {

  const inicio =
    (this.paginaActual - 1) * this.itemsPorPagina;

  return this.filteredKitchens.slice(
    inicio,
    inicio + this.itemsPorPagina
  );
}
get totalPaginas() {

  return Math.max(
    1,
    Math.ceil(
      this.filteredKitchens.length /
      this.itemsPorPagina
    )
  );

}
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

  this.filtros = {
    name: '',
    active: ''
  };

  this.sortColumn = '';
  this.sortDirection = 'asc';
  this.paginaActual = 1;

}
  async openCreateModal(kitchen?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateKitchenComponent,
      componentProps: { kitchen: kitchen }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarKitchens();
    });

    return await modal.present();
  }

  async toggleFlatState(kitchen: any) {
    const nuevoEstado = kitchen.active == 1 ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
   body.append("id", kitchen.id);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateKitchenState(body).subscribe((res: any) => {
      if (res.error === 0) {
       kitchen.active = nuevoEstado;
        this.presentToast("Estado actualizado", "success");
      } else {
        this.presentToast("Error al cambiar estado", "danger");
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
// FILTROS
filtros = {
  name: '',
  active: ''
};

// ORDENAMIENTO
sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

// PAGINACIÓN
paginaActual = 1;
itemsPorPagina = 10;
opcionesPagina = [5, 10, 20, 50];
async confirmarEliminar(kitchen:any){

  const alert = await this.alertCtrl.create({

    header:'Eliminar cocina',

    message:

    `¿Estás seguro de eliminar "${kitchen.name}"?`,

    buttons:[

      {

        text:'Cancelar',

        role:'cancel'

      },

      {

        text:'Eliminar',

        role:'destructive',

        handler:()=>{

          this.eliminarKitchen(kitchen);

        }

      }

    ]

  });

  await alert.present();

}
eliminarKitchen(kitchen:any){

  const body = new FormData();

  body.append(

    "id",

    kitchen.id

  );

  body.append(

    "system",

    this.server.getSystem()

  );

  this.server

  .deleteKitchen(body)

  .subscribe({

    next:(res:any)=>{

      if(res.error==0){

        this.presentToast(

          "Cocina eliminada",

          "success"

        );

        this.cargarKitchens();

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
