import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-create-cafe-tables',
  templateUrl: './create-cafe-tables.component.html',
})
export class CreateCafeTablesComponent implements OnInit {
  @Input() table: any; // Datos de la mesa si estamos editando

  flats: any[] = []; // Lista de pisos para el select
  newTable = {
    nombre: '',
    capacidad: 4,
    id_flats: '',
    estado: 'Libre' // Aseguramos un estado inicial por defecto
  };

  constructor(
    private modalCtrl: ModalController,
    private server: ServerContentService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.cargarPisos();
    if (this.table) {
      this.newTable.nombre = this.table.nombre;
      this.newTable.capacidad = this.table.capacidad;
      this.newTable.id_flats = this.table.id_flats;
      this.newTable.estado = this.table.estado || 'Libre';
    }
  }

  cargarPisos() {
    const system = this.server.getSystem();
    this.server.getFlatsCom(system).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.flats = res;
      } else if (res && res.data) {
        this.flats = res.data;
      }
    });
  }

  async saveTable() {
    if (!this.newTable.nombre || !this.newTable.id_flats) {
      this.presentToast('Nombre y Piso son obligatorios', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const system = this.server.getSystem();
    const body = new FormData();
    
    // Agregamos los campos asegurándonos de que no sean nulos
    body.append('nombre', this.newTable.nombre);
    body.append('capacidad', this.newTable.capacidad.toString());
    body.append('id_flats', this.newTable.id_flats.toString());
    body.append('system', system);
    
    // Si es nueva mesa, enviamos el estado 'Libre' explícitamente para el PHP
    body.append('estado', this.newTable.estado);

    if (this.table && this.table.id_table) {
      body.append('id_table', this.table.id_table.toString());
    }

    this.server.createTable(body).subscribe({
      next: (res: any) => {
        loading.dismiss();
        if (res && res.error === 0) {
          this.presentToast('Mesa guardada correctamente', 'success');
          this.modalCtrl.dismiss(true);
        } else {
          // Si el PHP devuelve error, mostramos el mensaje que viene del servidor
          this.presentToast(res.message || 'Error al guardar', 'danger');
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error("Error en servidor:", err);
        this.presentToast('Error de conexión con el servidor', 'danger');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ 
      message: m, 
      color: c, 
      duration: 2000,
      position: 'bottom' 
    });
    t.present();
  }
}