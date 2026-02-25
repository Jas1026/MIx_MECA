import { Component, OnInit } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-flats',
  templateUrl: './flats.page.html',
})
export class FlatsPage implements OnInit {

  flats: any[] = [];
  filteredFlats: any[] = [];

  searchName: string = '';

  isModalOpen = false;
  selectedFlat: any = null;

  constructor(private server: ServerContentService) {}

  ngOnInit() {
    this.loadFlats();
  }

  loadFlats() {
    this.server.loadFlats().subscribe((res: any) => {
      if (res.error == 0) {
        this.flats = res.data;
        this.filteredFlats = res.data;
      }
    });
  }

  applyFilters() {
    this.filteredFlats = this.flats.filter(flat =>
      flat.Name.toLowerCase().includes(this.searchName.toLowerCase())
    );
  }

  clearFilters() {
    this.searchName = '';
    this.filteredFlats = this.flats;
  }

  openFlatForm(flat: any = null) {
    this.selectedFlat = flat ? { ...flat } : { Name: '', Description: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}