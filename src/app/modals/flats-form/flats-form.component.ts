import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-flat-form',
templateUrl: './flats-form.component.html'})
export class FlatFormComponent {

  @Input() flat: any = {
    Name: '',
    Description: ''
  };

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  constructor(
    private server: ServerContentService,
    private toastCtrl: ToastController
  ) {}

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  saveFlat() {

    if (!this.flat.Name || this.flat.Name.trim() === '') {
      this.showToast("El nombre es obligatorio");
      return;
    }

    if (this.flat.Id_flats) {

      // 🔥 EDITAR
      this.server.updateFlat(this.flat).subscribe((res: any) => {
        if (res.error == 0) {
          this.showToast("Piso actualizado correctamente");
          this.save.emit();
          this.close.emit();
        }
      });

    } else {

      // 🔥 CREAR
      this.server.createFlat(this.flat).subscribe((res: any) => {
        if (res.error == 0) {
          this.showToast("Piso registrado correctamente");
          this.save.emit();
          this.close.emit();
        }
      });

    }
  }

  closeForm() {
    this.close.emit();
  }
}