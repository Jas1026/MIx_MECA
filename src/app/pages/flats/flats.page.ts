import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateFlatComponent } from '../../modals/create-flat/create-flat.component';

@Component({
  selector: 'app-flats',
  templateUrl: './flats.page.html',
  styleUrls: ['./flats.page.scss'],
})
export class FlatsPage implements OnInit {
  flats: any[] = [];
  filterNombre: string = '';

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  filtros = {
    Name: '',
    Description: '',
    state: ''
  };

  paginaActual = 1;
  itemsPorPagina = 10;
  opcionesPagina = [5, 10, 30, 50];

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarFlats();
  }

  cargarFlats() {
    const system = this.server.getSystem();
    this.server.getFlatsCom(system).subscribe((res: any) => {
      this.flats = res ? res : [];
    });
  }

  get filteredFlats() {
    let data = [...this.flats];

    if (this.filterNombre) {
      data = data.filter(f =>
        f.Name?.toLowerCase().includes(this.filterNombre.toLowerCase())
      );
    }

    data = data.filter(f => {
      const estadoTexto = f.state == 1 ? 'activo' : 'inactivo';

      return (
        (!this.filtros.Name || f.Name?.toLowerCase().includes(this.filtros.Name.toLowerCase())) &&
        (!this.filtros.Description || (f.Description || '').toLowerCase().includes(this.filtros.Description.toLowerCase())) &&
        (!this.filtros.state || estadoTexto.includes(this.filtros.state.toLowerCase()))
      );
    });

    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (valA == null) valA = '';
        if (valB == null) valB = '';

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get totalPaginas() {
    return Math.ceil(this.filteredFlats.length / this.itemsPorPagina) || 1;
  }

  get flatsPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.filteredFlats.slice(inicio, inicio + this.itemsPorPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  ordenar(columna: string) {
    if (this.sortColumn === columna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columna;
      this.sortDirection = 'asc';
    }
    this.paginaActual = 1;
  }

  limpiarTodosFiltros() {
    this.filterNombre = '';
    this.filtros = {
      Name: '',
      Description: '',
      state: ''
    };
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.paginaActual = 1;
  }

  // 🔥 NUEVO MÉTODO EXPORTAR: CON FORMATO VERDE CORPORATIVO Y REPORTE DE FILTROS APLICADOS
  exportarDatos(event: any) {
    const formato = event.detail.value;
    if (!formato) return;

    const datosAExportar = this.filteredFlats;

    if (!datosAExportar || datosAExportar.length === 0) {
      this.presentToast("No hay datos filtrados para exportar.", "danger");
      event.target.value = '';
      return;
    }

    // Estructuramos las filas de salida para el reporte
    const filasMapeadas = datosAExportar.map((f: any) => {
      return {
        'Nombre del Piso': f.Name || 'N/A',
        'Descripción / Notas': f.Description || '-',
        'Estado': f.state == 1 ? 'Activo' : 'Inactivo'
      };
    });

    if (formato === 'excel') {
      import('xlsx').then((XLSX) => {
        const worksheet = XLSX.utils.json_to_sheet(filasMapeadas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pisos');

        // Autocálculo de ancho de columnas
        const maxProps = Object.keys(filasMapeadas[0]);
        worksheet['!cols'] = maxProps.map(prop => ({
          wch: Math.max(...filasMapeadas.map((row: any) => (row[prop] ? row[prop].toString().length : 0)).concat(prop.length)) + 4
        }));

        XLSX.writeFile(workbook, `Reporte_Pisos_${new Date().toISOString().split('T')[0]}.xlsx`);
      }).catch(err => {
        console.error("Error XLSX:", err);
        this.presentToast("Error al generar el archivo Excel.", "danger");
      });

    } else if (formato === 'pdf') {
      Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]).then(([jsPDFModule, autoTableModule]) => {
        const jsPDF = jsPDFModule.default;
        const doc = new jsPDF('p', 'pt', 'a4'); // 'p' = Vertical es perfecto para 3 columnas

        // 1. TÍTULO PRINCIPAL Y METADATOS
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Tonalidad oscura elegante #2c3e50
        doc.text('Reporte de Gestión de Pisos / Áreas', 40, 40);

        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141); // Gris neutro #7f8c8d
        doc.text(`Generado el: ${new Date().toLocaleString()} | Total registros: ${filasMapeadas.length}`, 40, 55);

        // 2. DETECCIÓN TEXTUAL DE FILTROS EN PANTALLA (Tu Requerimiento)
        let stringsFiltros: string[] = [];

        if (this.filterNombre) stringsFiltros.push(`Buscador superior: "${this.filterNombre}"`);
        if (this.filtros.Name) stringsFiltros.push(`Filtro Nombre: "${this.filtros.Name}"`);
        if (this.filtros.Description) stringsFiltros.push(`Filtro Desc: "${this.filtros.Description}"`);
        if (this.filtros.state) stringsFiltros.push(`Filtro Estado: "${this.filtros.state}"`);

        if (stringsFiltros.length === 0) stringsFiltros.push('Ninguno (Mostrando todos los registros)');

        // Dibujar sección informativa de filtros en la parte superior del PDF
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros activos en pantalla:', 40, 75);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 120, 130);

        const textoFiltrosUnificados = stringsFiltros.join('  •  ');
        const lineasFiltroProcesadas = doc.splitTextToSize(textoFiltrosUnificados, 515); // Ajustado al ancho vertical A4
        doc.text(lineasFiltroProcesadas, 40, 90);

        // 3. CONSTRUCCIÓN DE LA TABLA (Mismo verde #2ecc71)
        const headers = [Object.keys(filasMapeadas[0])];
        const rows = filasMapeadas.map(obj => Object.values(obj));

        (autoTableModule as any).default(doc, {
          head: headers,
          body: rows,
          startY: 115, // Posición controlada debajo de las líneas de los filtros
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 7 },
          headStyles: {
            fillColor: [46, 204, 113], // Verde esmeralda vivo corporativo
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250] // Líneas alternas gris sutil
          },
          margin: { top: 40, left: 40, right: 40, bottom: 40 }
        });

        doc.save(`Reporte_Pisos_Filtrados_${new Date().toISOString().split('T')[0]}.pdf`);
      }).catch(err => {
        console.error("Error PDF:", err);
        this.presentToast("Error al generar el archivo PDF.", "danger");
      });
    }

    event.target.value = '';
  }

  async openCreateModal(flat?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateFlatComponent,
      componentProps: { flat: flat }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarFlats();
    });

    return await modal.present();
  }

  async toggleFlatState(flat: any) {
    const nuevoEstado = flat.state == 1 ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id_flat", flat.Id_flats);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateFlatState(body).subscribe((res: any) => {
      if (res.error === 0) {
        flat.state = nuevoEstado;
        this.presentToast("Estado actualizado", "success");
      } else {
        this.presentToast("Error al cambiar estado", "danger");
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  async confirmarEliminar(flat: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar piso',
      message: `¿Deseas eliminar "${flat.Name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => { this.eliminarFlat(flat); }
        }
      ]
    });
    await alert.present();
  }

  eliminarFlat(flat: any) {
    const body = new FormData();
    body.append("id_flat", flat.Id_flats);
    body.append("system", this.server.getSystem());

    this.server.deleteFlat(body).subscribe({
      next: (res: any) => {
        if (res.error == 0) {
          this.presentToast("Piso eliminado", "success");
          this.cargarFlats();
        } else {
          this.presentToast(res.message, "danger");
        }
      },
      error: () => {
        this.presentToast("Error del servidor", "danger");
      }
    });
  }
}