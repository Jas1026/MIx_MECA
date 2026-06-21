import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateKitchenComponent } from '../modals/create-kitchen/create-kitchen.component';

@Component({
  selector: 'app-kitchens',
  templateUrl: './kitchens.page.html',
  styleUrls: ['./kitchens.page.scss'],
})
export class KitchensPage implements OnInit {
  kitchens: any[] = [];
  filterNombre: string = '';

  // FILTROS BAJO COLUMNA
  filtros = {
    name: '',
    active: ''
  };

  // ORDENAMIENTO
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // PAGINACIÓN
  paginaActual = 1;
  itemsPorPagina = 10;
  opcionesPagina = [5, 10, 20, 50];

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarKitchens();
  }

  cargarKitchens() {
    const system = this.server.getSystem();
    this.server.getKitchensCom(system).subscribe((res: any) => {
      this.kitchens = res ? res : [];
    });
  }

  get filteredKitchens() {
    let data = [...this.kitchens];

    // Corregido: Se añade la barra de búsqueda principal superior que faltaba mapear en la query
    if (this.filterNombre) {
      data = data.filter(k => 
        k.name?.toLowerCase().includes(this.filterNombre.toLowerCase())
      );
    }

    data = data.filter(k => {
      const nombre =
        !this.filtros.name ||
        k.name?.toLowerCase().includes(this.filtros.name.toLowerCase());

      const estadoTexto = k.active == 1 ? 'activo' : 'inactivo';
      const estado =
        !this.filtros.active ||
        estadoTexto.includes(this.filtros.active.toLowerCase());

      return nombre && estado;
    });

    if (this.sortColumn) {
      data.sort((a, b) => {
        let valueA = a[this.sortColumn];
        let valueB = b[this.sortColumn];

        if (valueA == null) valueA = '';
        if (valueB == null) valueB = '';

        valueA = valueA.toString().toLowerCase();
        valueB = valueB.toString().toLowerCase();

        if (this.sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      });
    }

    return data;
  }

  get kitchensPaginadas() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.filteredKitchens.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.filteredKitchens.length / this.itemsPorPagina));
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

  limpiarTodosFiltros() {
    this.filterNombre = '';
    this.filtros = {
      name: '',
      active: ''
    };
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.paginaActual = 1;
  }

  // 🔥 NUEVO MÉTODO EXPORTAR: CON DISEÑO CORPORATIVO Y FILTROS DETALLADOS EN CABECERA DEL PDF
  exportarDatos(event: any) {
    const formato = event.detail.value;
    if (!formato) return;

    const datosAExportar = this.filteredKitchens;

    if (!datosAExportar || datosAExportar.length === 0) {
      this.presentToast("No hay datos filtrados para exportar.", "danger");
      event.target.value = '';
      return;
    }

    // Mapeamos las filas estructurando nombres limpios de columnas
    const filasMapeadas = datosAExportar.map((k: any) => {
      return {
        'Nombre de la Cocina': k.name || 'N/A',
        'Estado de Red': k.active == 1 ? 'Activo' : 'Inactivo'
      };
    });

    if (formato === 'excel') {
      import('xlsx').then((XLSX) => {
        const worksheet = XLSX.utils.json_to_sheet(filasMapeadas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cocinas');

        // Autocálculo de ancho de columnas dinámico
        const maxProps = Object.keys(filasMapeadas[0]);
        worksheet['!cols'] = maxProps.map(prop => ({
          wch: Math.max(...filasMapeadas.map((row: any) => (row[prop] ? row[prop].toString().length : 0)).concat(prop.length)) + 4
        }));

        XLSX.writeFile(workbook, `Reporte_Cocinas_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        const doc = new jsPDF('p', 'pt', 'a4'); // 'p' = Vertical para visualización óptima de 2 columnas

        // 1. TÍTULO PRINCIPAL Y METADATOS
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Color elegante #2c3e50
        doc.text('Reporte de Gestión de Cocinas', 40, 40);

        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141); // Gris neutro #7f8c8d
        doc.text(`Generado el: ${new Date().toLocaleString()} | Total registros: ${filasMapeadas.length}`, 40, 55);

        // 2. EXTRACCIÓN DETALLADA DE FILTROS EN PANTALLA
        let stringsFiltros: string[] = [];

        if (this.filterNombre) stringsFiltros.push(`Buscador general: "${this.filterNombre}"`);
        if (this.filtros.name) stringsFiltros.push(`Filtro Nombre: "${this.filtros.name}"`);
        if (this.filtros.active) stringsFiltros.push(`Filtro Estado: "${this.filtros.active}"`);

        if (stringsFiltros.length === 0) stringsFiltros.push('Ninguno (Mostrando lista completa)');

        // Dibujamos sección de filtros
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros activos en pantalla:', 40, 75);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 120, 130);

        const textoFiltrosUnificados = stringsFiltros.join('  •  ');
        const lineasFiltroProcesadas = doc.splitTextToSize(textoFiltrosUnificados, 515);
        doc.text(lineasFiltroProcesadas, 40, 90);

        // 3. GENERACIÓN DE LA TABLA AUTOTABLE (Mismo verde #2ecc71)
        const headers = [Object.keys(filasMapeadas[0])];
        const rows = filasMapeadas.map(obj => Object.values(obj));

        (autoTableModule as any).default(doc, {
          head: headers,
          body: rows,
          startY: 115,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 7 },
          headStyles: {
            fillColor: [46, 204, 113], // Color Verde Corporativo #2ecc71
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250] // Sombreado de renglones alternos
          },
          margin: { top: 40, left: 40, right: 40, bottom: 40 }
        });

        doc.save(`Reporte_Cocinas_Filtrados_${new Date().toISOString().split('T')[0]}.pdf`);
      }).catch(err => {
        console.error("Error PDF:", err);
        this.presentToast("Error al generar el archivo PDF.", "danger");
      });
    }

    event.target.value = '';
  }

  async openCreateModal(kitchen?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateKitchenComponent,
      componentProps: { kitchen: kitchen }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarKitchens();
    });

    return await modal.present();
  }

  async toggleFlatState(kitchen: any) {
    const nuevoEstado = kitchen.active == 1 ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id", kitchen.id);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateKitchenState(body).subscribe((res: any) => {
      if (res.error === 0) {
        kitchen.active = nuevoEstado;
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

  async confirmarEliminar(kitchen: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cocina',
      message: `¿Estás seguro de eliminar "${kitchen.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => { this.eliminarKitchen(kitchen); }
        }
      ]
    });
    await alert.present();
  }

  eliminarKitchen(kitchen: any) {
    const body = new FormData();
    body.append("id", kitchen.id);
    body.append("system", this.server.getSystem());

    this.server.deleteKitchen(body).subscribe({
      next: (res: any) => {
        if (res.error == 0) {
          this.presentToast("Cocina eliminada", "success");
          this.cargarKitchens();
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