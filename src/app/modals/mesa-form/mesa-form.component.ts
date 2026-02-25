import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-mesa-form',
  templateUrl: './mesa-form.component.html',
})
export class MesaFormComponent implements OnInit {

  @Input() mesa: any = {
    nombre: '',
    capacidad: '',
    estado: 'Libre',
    id_flats: null
  };

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  flats: any[] = [];

  constructor(private server: ServerContentService) {}

  ngOnInit() {
    this.loadFlats();
  }

  loadFlats() {
    this.server.loadFlats().subscribe((res: any) => {
      if (res.error == 0) {
        this.flats = res.data;
      }
    });
  }

  saveMesa() {

    if (this.mesa.id_table) {
      // 🔥 EDITAR
      this.server.updateMesa(this.mesa).subscribe((res: any) => {
        if (res.error == 0) {
          alert("Mesa actualizada");
          this.save.emit();
          this.close.emit();
        }
      });

    } else {
      // 🔥 CREAR
      this.server.createMesa(this.mesa).subscribe((res: any) => {
        if (res.error == 0) {
          alert("Mesa registrada");
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