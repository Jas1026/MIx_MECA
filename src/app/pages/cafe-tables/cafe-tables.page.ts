import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateCafeTablesComponent } from '../../modals/create-cafe-tables/create-cafe-tables.component';

@Component({
  selector: 'app-cafe-tables',
  templateUrl: './cafe-tables.page.html',
  styleUrls: ['./cafe-tables.page.scss'],
})
export class CafeTablesPage implements OnInit {
  tables: any[] = [];
  flats: any[] = []; 
  filterNombre: string = '';
  selectedFlat: string = 'all';

  filtros = {
    nombre: '',
    piso: '',
    capacidad: '',
    estado: ''
  };

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  paginaActual = 1;
  itemsPorPagina = 10;
  opcionesPagina = [5, 10, 20, 50];

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarMesas();
    this.cargarPisos();
  }

  cargarPisos() {
    const system = this.server.getSystem();
    this.server.getFlatsCom(system).subscribe((res: any) => {
      if (Array.isArray(res)) this.flats = res;
    });
  }

  cargarMesas() {
    const system = this.server.getSystem();
    this.server.getTables_complete(system).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.tables = res;
      } else {
        this.tables = [];
        console.error("Respuesta no es array:", res);
      }
    });
  }

  get filteredTables() {
    let data = [...this.tables];

    data = data.filter(t => {
      const nombre = !this.filtros.nombre || t.nombre?.toLowerCase().includes(this.filtros.nombre.toLowerCase());
      const piso = !this.filtros.piso || t.flat_name?.toLowerCase().includes(this.filtros.piso.toLowerCase());
      const capacidad = !this.filtros.capacidad || String(t.capacidad).includes(this.filtros.capacidad);
      const estado = !this.filtros.estado || t.estado?.toLowerCase().includes(this.filtros.estado.toLowerCase());
      
      const filtroGeneral = !this.filterNombre || t.nombre?.toLowerCase().includes(this.filterNombre.toLowerCase());
      const filtroPisoSelect = this.selectedFlat === 'all' || t.id_flats == this.selectedFlat;

      return nombre && piso && capacidad && estado && filtroGeneral && filtroPisoSelect;
    });

    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        let valorA = a[this.sortColumn];
        let valorB = b[this.sortColumn];

        valorA = valorA?.toString().toLowerCase() || '';
        valorB = valorB?.toString().toLowerCase() || '';

        if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get totalPaginas() {
    return Math.ceil(this.filteredTables.length / this.itemsPorPagina) || 1;
  }

  get mesasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.filteredTables.slice(inicio, inicio + this.itemsPorPagina);
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
    this.filtros = {
      nombre: '',
      piso: '',
      capacidad: '',
      estado: ''
    };
    this.filterNombre = '';
    this.selectedFlat = 'all';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.paginaActual = 1;
  }

  // 🔥 NUEVO MÉTODO EXPORTAR: DETECTA TODOS LOS FILTROS ACTIVOS DE MESAS Y LOS COLOCA EN EL REPORTE
  exportarDatos(event: any) {
    const formato = event.detail.value;
    if (!formato) return;

    const datosAExportar = this.filteredTables;

    if (!datosAExportar || datosAExportar.length === 0) {
      this.presentToast("No hay datos filtrados para exportar.", "danger");
      event.target.value = '';
      return;
    }

    // Mapeo estructurado para las columnas del archivo
    const filasMapeadas = datosAExportar.map((t: any) => {
      return {
        'Identificador / Mesa': t.nombre || 'N/A',
        'Piso asignado': t.flat_name || 'Sin Asignar',
        'Capacidad (Personas)': t.capacidad || 0,
        'Estado de Atención': t.estado || 'N/A'
      };
    });

    if (formato === 'excel') {
      import('xlsx').then((XLSX) => {
        const worksheet = XLSX.utils.json_to_sheet(filasMapeadas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Mesas');

        // Calcular ancho dinámico
        const maxProps = Object.keys(filasMapeadas[0]);
        worksheet['!cols'] = maxProps.map(prop => ({
          wch: Math.max(...filasMapeadas.map((row: any) => (row[prop] ? row[prop].toString().length : 0)).concat(prop.length)) + 4
        }));

        XLSX.writeFile(workbook, `Reporte_Mesas_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        const doc = new jsPDF('p', 'pt', 'a4');

        // 1. TÍTULO GENERAL Y REGISTROS
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Tono #2c3e50 oscuro corporativo
        doc.text('Reporte de Gestión de Mesas', 40, 40);

        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141);
        doc.text(`Generado: ${new Date().toLocaleString()} | Registros en reporte: ${filasMapeadas.length}`, 40, 55);

        // 2. DETECTAR TEXTUALMENTE CUALQUIER FILTRO QUE EL USUARIO HAYA ACTIVADO (Tu requerimiento)
        let stringsFiltros: string[] = [];

        if (this.filterNombre) stringsFiltros.push(`Buscador superior: "${this.filterNombre}"`);
        if (this.selectedFlat !== 'all') {
          const nombrePisoSeleccionado = this.flats.find(f => f.Id_flats == this.selectedFlat)?.Name || this.selectedFlat;
          stringsFiltros.push(`Selector Piso: "${nombrePisoSeleccionado}"`);
        }
        if (this.filtros.nombre) stringsFiltros.push(`Filtro Mesa: "${this.filtros.nombre}"`);
        if (this.filtros.piso) stringsFiltros.push(`Filtro Piso col: "${this.filtros.piso}"`);
        if (this.filtros.capacidad) stringsFiltros.push(`Filtro Capacidad: "${this.filtros.capacidad}"`);
        if (this.filtros.estado) stringsFiltros.push(`Filtro Estado col: "${this.filtros.estado}"`);

        if (stringsFiltros.length === 0) stringsFiltros.push('Ninguno (Se exportó la lista completa)');

        // Dibujar bloque informativo de filtros
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros aplicados en pantalla:', 40, 75);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 120, 130);

        const textoFiltrosUnificados = stringsFiltros.join('  •  ');
        const lineasFiltroProcesadas = doc.splitTextToSize(textoFiltrosUnificados, 515);
        doc.text(lineasFiltroProcesadas, 40, 90);

        // 3. TABLA CON EL FORMATO VERDE CORPORATIVO (#2ecc71)
        const headers = [Object.keys(filasMapeadas[0])];
        const rows = filasMapeadas.map(obj => Object.values(obj));

        (autoTableModule as any).default(doc, {
          head: headers,
          body: rows,
          startY: 115,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 7 },
          headStyles: {
            fillColor: [46, 204, 113], // Color Verde de la Suite
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          },
          margin: { top: 40, left: 40, right: 40, bottom: 40 }
        });

        doc.save(`Reporte_Mesas_Filtradas_${new Date().toISOString().split('T')[0]}.pdf`);
      }).catch(err => {
        console.error("Error PDF:", err);
        this.presentToast("Error al generar el archivo PDF.", "danger");
      });
    }

    event.target.value = '';
  }

  async openCreateModal(table?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateCafeTablesComponent,
      componentProps: { table: table }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarMesas();
    });

    return await modal.present();
  }

  async toggleTableState(table: any) {
    const nuevoEstado = (table.estado === 'Libre') ? 'Ocupada' : 'Libre';
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id_table", table.id_table);
    body.append("estado", nuevoEstado); 
    body.append("system", system);

    this.server.updateTableState(body).subscribe((res: any) => {
      if (res.error === 0) {
        table.estado = nuevoEstado; 
        this.presentToast(`Mesa ahora está ${nuevoEstado}`, "success");
      } else {
        this.presentToast("Error al cambiar estado", "danger");
      }
    });
  }

  getStatusColor(estado: string): string {
    if (!estado) return 'medium';
    const s = estado.toLowerCase();
    if (s === 'libre') return 'success';   
    if (s === 'ocupada') return 'danger';  
    return 'medium';
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  async confirmarEliminar(table: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar mesa',
      message: `¿Deseas eliminar "${table.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => { this.eliminarMesa(table); }
        }
      ]
    });
    await alert.present();
  }

  eliminarMesa(table: any) {
    const body = new FormData();
    body.append("id_table", table.id_table);
    body.append("system", this.server.getSystem());

    this.server.deleteTable(body).subscribe({
      next: (res: any) => {
        if (res.error == 0) {
          this.presentToast("Mesa eliminada", "success");
          this.cargarMesas();
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