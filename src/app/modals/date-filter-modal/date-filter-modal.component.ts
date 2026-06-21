import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-filter-modal',
  templateUrl: './date-filter-modal.component.html',
  styleUrls: ['./date-filter-modal.component.scss'],
})
export class DateFilterModalComponent implements OnInit {
  @Input() dateMode: string = 'single';
  @Input() dateFilterType: string = 'day';
  @Input() selectedDate: string = '';
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Inicializar con la fecha de hoy en formato ISO si están vacíos al abrir
    const today = new Date().toISOString();
    if (!this.selectedDate) this.selectedDate = today;
    if (!this.startDate) this.startDate = today;
    if (!this.endDate) this.endDate = today;
  }

  /**
   * Cambia dinámicamente el comportamiento visual del ion-datetime
   * según la selección del usuario.
   */
  getPresentationMode(): 'date' | 'month-year' | 'year' {
    if (this.dateFilterType === 'year') {
      return 'year';
    } else if (this.dateFilterType === 'month') {
      return 'month-year';
    }
    return 'date'; // Por defecto muestra Día, Mes y Año completo
  }

  close() {
    this.modalCtrl.dismiss(null);
  }

  clearAndClose() {
    this.modalCtrl.dismiss({
      cleared: true,
      dateMode: 'single',
      dateFilterType: 'day',
      selectedDate: '',
      startDate: '',
      endDate: ''
    });
  }

  applyFilters() {
    this.modalCtrl.dismiss({
      cleared: false,
      dateMode: this.dateMode,
      dateFilterType: this.dateFilterType,
      selectedDate: this.selectedDate,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }
}