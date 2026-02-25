import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
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
    private toastCtrl: ToastController
  ) { }

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

  // Lógica de doble filtro: Nombre y Piso
  get filteredTables() {
    if (!this.tables || !Array.isArray(this.tables)) return [];

    return this.tables.filter(t => {
      const matchNombre = t.nombre.toLowerCase().includes(this.filterNombre.toLowerCase());
      const matchPiso = (this.selectedFlat === 'all') || (t.id_flats == this.selectedFlat);
      return matchNombre && matchPiso;
    });
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
  // Lógica: Si está 'Inactiva', la pasamos a 'Libre'. Si no, la desactivamos.
  const nuevoEstado = (table.estado === 'Inactiva') ? 'Libre' : 'Inactiva';
  const system = this.server.getSystem();
  
  let body = new FormData();
  body.append("id_table", table.id_table);
  body.append("estado", nuevoEstado); // Enviamos el texto
  body.append("system", system);

  this.server.updateTableState(body).subscribe((res: any) => {
    if (res.error === 0) {
      table.estado = nuevoEstado; // Ahora el estado en memoria será 'Libre' o 'Inactiva'
      this.presentToast(`Mesa actualizada a ${nuevoEstado}`, "success");
    } else {
      this.presentToast("Error al cambiar estado", "danger");
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
  getStatusColor(estado: string): string {
  if (!estado) return 'medium';
  const s = estado.toLowerCase();
  if (s === 'libre') return 'success';   // Verde
  if (s === 'ocupada' || s === 'ready') return 'warning'; // Amarillo/Naranja
  if (s === 'inactiva') return 'danger';  // Rojo
  return 'medium';
}
}