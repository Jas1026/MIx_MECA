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
    id_flats: ''
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
    }
  }

  cargarPisos() {
    const system = this.server.getSystem();
    // Reutilizamos el servicio de pisos que ya tienes
    this.server.getFlatsCom(system).subscribe((res: any) => {
      this.flats = res;
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
    body.append('nombre', this.newTable.nombre);
    body.append('capacidad', this.newTable.capacidad.toString());
    body.append('id_flats', this.newTable.id_flats);
    body.append('system', system);
    
    if (this.table) {
      body.append('id_table', this.table.id_table);
    }

    this.server.createTable(body).subscribe({
      next: (res: any) => {
        loading.dismiss();
        if (res.error === 0) {
          this.presentToast('Mesa guardada correctamente', 'success');
          this.modalCtrl.dismiss(true);
        }
      },
      error: () => {
        loading.dismiss();
        this.presentToast('Error de servidor', 'danger');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000 });
    t.present();
  }
}