import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {

  @Input() title: string = '';
  @Input() message: string = '';

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss(false);
  }

  confirm() {
    this.modalCtrl.dismiss(true);
  }

}