import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateCafeTablesComponent } from '../../modals/create-cafe-tables/create-cafe-tables.component';

@Component({
  selector: 'app-cafe-tables',
  templateUrl: './cafe-tables.page.html',
  styleUrls: ['./cafe-tables.page.scss'],
})
export class CafeTablesPage implements OnInit {
  tables: any[] = [];
  flats: any[] = []; // Para el select de filtros
  filterNombre: string = '';
  selectedFlat: string = 'all'; // Filtro de piso por defecto

 constructor(

  private server: ServerContentService,

  private modalCtrl: ModalController,

  private toastCtrl: ToastController,

  private alertCtrl: AlertController

){ }

  ngOnInit() {
    this.cargarDatos();
  }

  // Cargamos ambos para que el filtro tenga opciones
  cargarDatos() {
    this.cargarMesas();
    this.cargarPisos();
  }

  cargarPisos() {
    const system = this.server.getSystem();
    this.server.getFlatsCom(system).subscribe((res: any) => {
      if (Array.isArray(res)) this.flats = res;
    });
  }

  cargarMesas() {
    const system = this.server.getSystem();
    this.server.getTables_complete(system).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.tables = res;
      } else {
        this.tables = [];
        console.error("Respuesta no es array:", res);
      }
    });
  }
get filteredTables() {

  let data = [...this.tables];

  data = data.filter(t => {

    const nombre =
      !this.filtros.nombre ||
      t.nombre?.toLowerCase()
      .includes(this.filtros.nombre.toLowerCase());

    const piso =
      !this.filtros.piso ||
      t.flat_name?.toLowerCase()
      .includes(this.filtros.piso.toLowerCase());

    const capacidad =
      !this.filtros.capacidad ||
      String(t.capacidad)
      .includes(this.filtros.capacidad);

    const estado =
      !this.filtros.estado ||
      t.estado?.toLowerCase()
      .includes(this.filtros.estado.toLowerCase());

    const filtroGeneral =
      !this.filterNombre ||
      t.nombre?.toLowerCase()
      .includes(this.filterNombre.toLowerCase());

    const filtroPisoSelect =
      this.selectedFlat === 'all'
      || t.id_flats == this.selectedFlat;

    return (
      nombre &&
      piso &&
      capacidad &&
      estado &&
      filtroGeneral &&
      filtroPisoSelect
    );

  });

  if (this.sortColumn) {

    data.sort((a:any,b:any) => {

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

  return data;

}
get totalPaginas() {

  return Math.ceil(
    this.filteredTables.length /
    this.itemsPorPagina
  ) || 1;

}
get mesasPaginadas() {

  const inicio =
    (this.paginaActual - 1)
    * this.itemsPorPagina;

  return this.filteredTables.slice(
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

  async openCreateModal(table?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateCafeTablesComponent,
      componentProps: { table: table }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarMesas();
    });

    return await modal.present();
  }
  async toggleTableState(table: any) {
  // Solo permitimos dos estados: Libre y Ocupada
  const nuevoEstado = (table.estado === 'Libre') ? 'Ocupada' : 'Libre';
  const system = this.server.getSystem();
  
  let body = new FormData();
  body.append("id_table", table.id_table);
  body.append("estado", nuevoEstado); 
  body.append("system", system);

  this.server.updateTableState(body).subscribe((res: any) => {
    if (res.error === 0) {
      table.estado = nuevoEstado; 
      this.presentToast(`Mesa ahora está ${nuevoEstado}`, "success");
    } else {
      this.presentToast("Error al cambiar estado", "danger");
    }
  });
}

// Actualizamos los colores para que coincidan con tu flujo
getStatusColor(estado: string): string {
  if (!estado) return 'medium';
  const s = estado.toLowerCase();
  if (s === 'libre') return 'success';   // Verde para Libre
  if (s === 'ocupada') return 'danger';  // Rojo para Ocupada (No disponible)
  return 'medium';
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
  filtros = {
  nombre: '',
  piso: '',
  capacidad: '',
  estado: ''
};

sortColumn = '';
sortDirection: 'asc' | 'desc' = 'asc';

paginaActual = 1;
itemsPorPagina = 10;

opcionesPagina = [5,10,20,50];
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

  this.filtros = {
    nombre: '',
    piso: '',
    capacidad: '',
    estado: ''
  };

  this.filterNombre = '';
  this.selectedFlat = 'all';

  this.sortColumn = '';
  this.sortDirection = 'asc';

  this.paginaActual = 1;

}
async confirmarEliminar(table:any){

  const alert = await this.alertCtrl.create({

    header:'Eliminar mesa',

    message:

    `¿Deseas eliminar "${table.nombre}"?`,

    buttons:[

      {

        text:'Cancelar',

        role:'cancel'

      },

      {

        text:'Eliminar',

        role:'destructive',

        handler:()=>{

          this.eliminarMesa(table);

        }

      }

    ]

  });

  await alert.present();

}
eliminarMesa(table:any){

  const body = new FormData();

  body.append(

    "id_table",

    table.id_table

  );

  body.append(

    "system",

    this.server.getSystem()

  );

  this.server

  .deleteTable(body)

  .subscribe({

    next:(res:any)=>{

      if(res.error==0){

        this.presentToast(

          "Mesa eliminada",

          "success"

        );

        this.cargarMesas();

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