import { Component, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-registrar-mesa',
  templateUrl: './registrar-mesa.page.html',
  styleUrls: ['./registrar-mesa.page.scss'],
})
export class RegistrarMesaPage implements OnInit {

  mesas: any[] = [];


filteredMesas: any[] = [];

searchName: string = '';
selectedState: string = '';

  isModalOpen = false;
  isEditing = false;

  mesaData: any = {
    id_table: '',
    nombre: '',
    capacidad: '',
    estado: 'Libre',
    id_flats: ''
  };

  constructor(private server: ServerContentService) {}

  ngOnInit() {
    this.loadMesas();
  }



  selectedMesa: any = {
  nombre: '',
  capacidad: '',
  estado: 'Libre',
  id_flats: null
};
 
loadMesas() {
  this.server.loadMesas().subscribe({
    next: (res: any) => {
      console.log("Respuesta:", res);

      if (res && res.error == 0 && Array.isArray(res.data)) {
        this.mesas = res.data;        // ✅ SOLO el array
        this.filteredMesas = [...res.data];
      } else {
        this.mesas = [];
        this.filteredMesas = [];
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}
  openMesaForm(mesa: any = null) {

  if (mesa) {
    this.selectedMesa = { ...mesa };
  } else {
    this.selectedMesa = {
      nombre: '',
      capacidad: '',
      estado: 'Libre',
      id_flats: null
    };
  }

  this.isModalOpen = true;
}

  closeModal() {
    this.isModalOpen = false;
  }


  applyFilters() {

  this.filteredMesas = this.mesas.filter(mesa => {

    const matchesName =
      this.searchName === '' ||
      mesa.nombre.toLowerCase().includes(this.searchName.toLowerCase());

    const matchesState =
      this.selectedState === '' ||
      mesa.estado == this.selectedState;

    return matchesName && matchesState;
  });

}

clearFilters() {
  this.searchName = '';
  this.selectedState = '';
  this.filteredMesas = this.mesas;
}
}