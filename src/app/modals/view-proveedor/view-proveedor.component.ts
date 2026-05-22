import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view-proveedor',
  templateUrl: './view-proveedor.component.html',
  styleUrls: ['./view-proveedor.component.scss'],
})
export class ViewProveedorComponent implements OnInit {

  @Input() proveedor: any;

  constructor(
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}