import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { ViewOrderProductsComponent } from 'src/app/modals/view-order-products/view-order-products.component';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-pedidos-unitarios',
  templateUrl: './pedidos-unitarios.page.html',
  styleUrls: ['./pedidos-unitarios.page.scss'],
})
export class PedidosUnitariosPage implements OnInit, OnDestroy {

  private clockInterval: any;

  fechaMostrada: string = '';
  meseros: any[] = [];
  meseroSeleccionado: string = '';
  estadoSeleccionado: string = '';
  pedidos: any[] = [];
  fechaFiltro: string = '';

  pisoSeleccionado: string = '';
  pisos: any[] = [];

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.server.getWaiters().subscribe((res: any) => {
      this.meseros = res.data;
    });
    this.cargarPisos()
    this.cargarPedidos();
    this.startClock();
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  cargarPedidos() {
    const userId = sessionStorage.getItem("user_id");

    this.server.getOrdersByUser(userId!)
      .subscribe((res: any) => {
        if (res.error === 0) {

          this.pedidos = res.data.map((p: any) => ({
            ...p,
            timeDisplay: '0.00'
          }));

          this.updateAllClocks();
        }
      });
  }
  get pedidosFiltrados() {

    let lista = [...this.pedidos];

    lista = lista.filter(p => {

      if (
        this.estadoSeleccionado &&
        (
          this.estadoSeleccionado === 'cancel'
            ? (p.status !== 'cancel' && p.cancel != 1)
            : p.status !== this.estadoSeleccionado
        )
      ) {
        return false;
      }

      if (
        this.pisoSeleccionado &&
        p.nombre_piso !== this.pisoSeleccionado
      ) {
        return false;
      }

      if (this.fechaFiltro) {

        const fechaPedido =
          new Date(p.order_date)
            .toISOString()
            .split('T')[0];

        if (fechaPedido !== this.fechaFiltro) {
          return false;
        }
      }

      if (
        this.filtros.nombre_mesa &&
        !String(p.nombre_mesa)
          .toLowerCase()
          .includes(this.filtros.nombre_mesa.toLowerCase())
      ) {
        return false;
      }

      if (
        this.filtros.nombre_piso &&
        !String(p.nombre_piso)
          .toLowerCase()
          .includes(this.filtros.nombre_piso.toLowerCase())
      ) {
        return false;
      }

      if (
        this.filtros.order_date &&
        !String(p.order_date)
          .toLowerCase()
          .includes(this.filtros.order_date.toLowerCase())
      ) {
        return false;
      }

      if (
        this.filtros.status &&
        !String(p.status)
          .toLowerCase()
          .includes(this.filtros.status.toLowerCase())
      ) {
        return false;
      }

      return true;

    });

    if (this.sortColumn) {

      lista.sort((a, b) => {

        const valorA =
          String(a[this.sortColumn] ?? '')
            .toLowerCase();

        const valorB =
          String(b[this.sortColumn] ?? '')
            .toLowerCase();

        const resultado =
          valorA > valorB ? 1 :
            valorA < valorB ? -1 : 0;

        return this.sortDirection === 'asc'
          ? resultado
          : -resultado;

      });

    }

    return lista;
  }
  ordenar(columna: string) {

    if (this.sortColumn === columna) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = columna;
      this.sortDirection = 'asc';

    }

    this.paginaActual = 1;
  }
  paginaActual = 1;

  itemsPorPagina = 10;

  opcionesPagina = [5, 10, 30];
  get totalPaginas(): number {

    return Math.ceil(
      this.pedidosFiltrados.length /
      this.itemsPorPagina
    ) || 1;

  }
  get pedidosPaginados() {

    const inicio =
      (this.paginaActual - 1)
      * this.itemsPorPagina;

    const fin =
      inicio + this.itemsPorPagina;

    return this.pedidosFiltrados.slice(
      inicio,
      fin
    );
  }
  paginaAnterior() {

    if (this.paginaActual > 1) {
      this.paginaActual--;
    }

  }

  paginaSiguiente() {

    if (
      this.paginaActual <
      this.totalPaginas
    ) {
      this.paginaActual++;
    }

  }

  cambiarItemsPorPagina() {

    this.paginaActual = 1;

  }

  limpiarFecha() {
    this.fechaFiltro = '';
    this.fechaMostrada = '';
  }

  fechaSeleccionada(event: any, modal: any) {
    const fecha = event.detail.value;
    if (fecha) {
      const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
      this.fechaFiltro = fechaFormateada;
      this.fechaMostrada = fechaFormateada;
      modal.dismiss();
    }
  }

  startClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    this.clockInterval = setInterval(() => {
      this.updateAllClocks();
    }, 1000);
  }
  private updateAllClocks() {
    const now = new Date().getTime();

    this.pedidos = this.pedidos.map(pedido => {

      // 1️⃣ SI ESTÁ CERRADO: Usamos el tiempo real de la base de datos
      if (pedido.status === 'closed') {
        // Tomamos el actual_time (ej: 1.15), lo forzamos a 2 decimales y cambiamos . por :
        const tiempoGuardado = parseFloat(pedido.actual_time || '0').toFixed(2);
        return {
          ...pedido,
          timeDisplay: tiempoGuardado.replace('.', ':')
        };
      }

      // 2️⃣ SI ESTÁ ABIERTO: Calculamos el cronómetro en vivo
      if (pedido.order_date) {
        const dateStr = pedido.order_date.replace(' ', 'T');
        const startTime = new Date(dateStr).getTime();
        const diffMs = now - startTime;

        if (diffMs > 0) {
          const totalSeconds = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;

          return {
            ...pedido,
            timeDisplay: `${mins}:${secs.toString().padStart(2, '0')}`
          };
        }
      }
      return pedido;
    });
  }

  getTimerClassPedido(pedido: any): string {
    const transcurrido = parseFloat(pedido.timeDisplay || '0');
    const estimado = parseInt(pedido.estimated_total_time) || 0;

    if (pedido.status === 'ready') {
      return 'ready';
    }

    if (estimado > 0 && transcurrido >= estimado) {
      return 'delayed';
    }

    return 'normal';
  }

  getReadyMessage(pedido: any): string {
    if (pedido.status === 'ready') {
      return 'Pedido listo, solo debes entregarlo';
    }
    return '';
  }

  async View_Order(p: any) {
    const modal = await this.modalCtrl.create({
      component: ViewOrderProductsComponent,
      componentProps: {
        order_id: p.order_id,
        editMode: true
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data) {
        this.cargarPedidos();
      }
    });

    await modal.present();
  }
  cargarPisos() {
    // Asegúrate de tener este método en tu servicio server-content
    this.server.getFlats_panel().subscribe((res: any) => {
      if (res.error === 0) {
        this.pisos = res.data;
      }
    });
  }
  limpiarFiltros() {

    this.fechaFiltro = '';
    this.fechaMostrada = '';

    this.estadoSeleccionado = '';
    this.pisoSeleccionado = '';
    this.meseroSeleccionado = '';

    this.filtros = {
      nombre_mesa: '',
      nombre_piso: '',
      order_date: '',
      status: '',
      estimated_total_time: ''
    };

    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.paginaActual = 1;
  }
  async cambiarMesa(pedido: any) {
    this.server.getFlats().subscribe(async (res: any) => {

      if (!res.data || res.data.length === 0) {
        this.presentToast("No se encontraron áreas configuradas.");
        return;
      }

      const inputsPisos = res.data.map((p: any) => ({
        type: 'radio',
        label: p.name,
        // CAMBIO AQUÍ: Debe ser Id_flats para coincidir con tu JSON
        value: p.Id_flats,
        checked: p.name === pedido.nombre_piso
      }));

      const alertPisos = await this.alertCtrl.create({
        header: 'Seleccionar Piso / Área',
        subHeader: `Mesa actual: ${pedido.nombre_mesa}`,
        inputs: inputsPisos,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Siguiente',
            handler: (idFlatSeleccionado) => {
              // Ahora idFlatSeleccionado ya no será undefined
              if (idFlatSeleccionado) {
                this.seleccionarNuevaMesa(pedido, idFlatSeleccionado);
                return true;
              } else {
                this.presentToast("Por favor, selecciona un área.");
                return false;
              }
            }
          }
        ]
      });

      await alertPisos.present();
    });
  }
  async seleccionarNuevaMesa(pedido: any, id_flat: any) {
    console.log("Cargando mesas para el piso ID:", id_flat);

    if (!id_flat) {
      this.presentToast("Error: No se seleccionó un piso válido");
      return;
    }

    this.server.getTables_new(id_flat).subscribe(async (res: any) => {

      if (!res.data || res.data.length === 0) {
        this.presentToast("No hay mesas registradas en este área");
        return;
      }

      const inputsMesas = res.data.map((m: any) => ({
        type: 'radio',
        label: m.nombre,
        value: m.id_table,
      }));

      const alertMesas = await this.alertCtrl.create({
        header: 'Seleccionar Nueva Mesa',
        inputs: inputsMesas,
        buttons: [
          { text: 'Atrás', handler: () => this.cambiarMesa(pedido) },
          {
            text: 'Cambiar',
            handler: (id_table) => {
              if (id_table) {
                this.confirmarCambio(pedido.order_id, id_table);
                return true; // <--- Agregamos retorno explícito
              } else {
                this.presentToast("Debes seleccionar una mesa");
                return false; // Evita que se cierre el alert
              }
            }
          }
        ]
      });
      await alertMesas.present();
    });
  }
  confirmarCambio(orderId: number, newTableId: number) {
    this.server.changeOrderTable(orderId, newTableId).subscribe((res: any) => {
      if (res.error === 0) {
        this.cargarPedidos(); // Recargar la lista
        this.presentToast("Mesa cambiada correctamente");
      }
    });
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000 });
    toast.present();
  }
  filtros = {
    nombre_mesa: '',
    nombre_piso: '',
    order_date: '',
    status: '',
    estimated_total_time: ''
  };

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  exportarDatos(event: any) {
  const formato = event.detail.value;
  if (!formato) return;

  const datosAExportar = this.pedidosFiltrados;

  if (!datosAExportar || datosAExportar.length === 0) {
    this.presentToast("No hay datos filtrados para exportar.");
    event.target.value = '';
    return;
  }

  // Mapeamos los datos con los títulos correctos
  const filasMapeadas = datosAExportar.map((p: any) => {
    let estadoEsp = 'Abierto';
    if (p.status === 'closed') estadoEsp = 'Finalizado';
    if (p.status === 'cancel') estadoEsp = 'Cancelado';
    if (p.status === 'ready') estadoEsp = 'Listo';

    return {
      'ID Pedido': p.order_id,
      'Ubicación / Mesa': p.nombre_mesa,
      'Área / Piso': p.nombre_piso,
      'Fecha': p.order_date,
      'Estado': estadoEsp,
      'Tiempo Transcurrido / Guardado': p.timeDisplay || '0:00',
      'Tiempo Estimado (min)': `${p.estimated_total_time} min`,
      'Mesero': p.mesero || 'N/A'
    };
  });

  if (formato === 'excel') {
    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(filasMapeadas);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mis Pedidos');

      const maxProps = Object.keys(filasMapeadas[0]);
      worksheet['!cols'] = maxProps.map(prop => ({
        wch: Math.max(...filasMapeadas.map((row: any) => (row[prop] ? row[prop].toString().length : 0)).concat(prop.length)) + 3
      }));

      XLSX.writeFile(workbook, `Mis_Pedidos_Filtrados_${new Date().toISOString().split('T')[0]}.xlsx`);
    }).catch(err => {
      console.error("Error cargando XLSX:", err);
      this.presentToast("Error al generar el archivo Excel.");
    });

  } else if (formato === 'pdf') {
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jsPDFModule, autoTableModule]) => {
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF('l', 'pt', 'a4'); // 'l' = Horizontal para mejor distribución de columnas

      // 1. TÍTULO PRINCIPAL DE LA PÁGINA
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80); // Color oscuro elegante #2c3e50
      doc.text('Reporte de Mis Pedidos', 40, 40);

      // Metadatos básicos del reporte
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141); // Gris suave #7f8c8d
      doc.text(`Generado el: ${new Date().toLocaleString()} | Total registros: ${filasMapeadas.length}`, 40, 55);

      // 2. CONSTRUCCIÓN DE LA SECCIÓN DE FILTROS APLICADOS (Tu requerimiento 2)
      let stringsFiltros: string[] = [];

      // Filtro de Estado superior
      if (this.estadoSeleccionado) {
        let est = this.estadoSeleccionado === 'closed' ? 'Finalizado' : (this.estadoSeleccionado === 'cancel' ? 'Cancelado' : 'Abierto');
        stringsFiltros.push(`Estado: ${est}`);
      } else {
        stringsFiltros.push(`Estado: Todos`);
      }

      // Filtro de Ubicación/Área superior
      if (this.pisoSeleccionado) {
        stringsFiltros.push(`Área: ${this.pisoSeleccionado}`);
      } else {
        stringsFiltros.push(`Área: Todas`);
      }

      // Filtro de fecha en el calendario
      if (this.fechaFiltro) {
        stringsFiltros.push(`Fecha Filtro: ${this.fechaFiltro}`);
      }

      // Filtros por input de texto directo de la tabla de datos
      if (this.filtros.nombre_mesa) stringsFiltros.push(`Búsq. Mesa: "${this.filtros.nombre_mesa}"`);
      if (this.filtros.order_date) stringsFiltros.push(`Búsq. Fecha: "${this.filtros.order_date}"`);
      if (this.filtros.status) stringsFiltros.push(`Búsq. Estado: "${this.filtros.status}"`);
      if (this.filtros.estimated_total_time) stringsFiltros.push(`Búsq. Tiempo: "${this.filtros.estimated_total_time}"`);

      // Pintar la sección informativa de los filtros activos en el PDF
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      doc.setFont('helvetica', 'bold');
      doc.text('Filtros activos en pantalla:', 40, 75);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 120, 130);
      
      // Juntamos los filtros por un separador elegante "•"
      const textoFiltrosUnificados = stringsFiltros.join('  •  ');
      // Si el texto es muy largo, usamos splitTextToSize para que no se salga de los márgenes del PDF
      const lineasFiltroProcesadas = doc.splitTextToSize(textoFiltrosUnificados, 760); 
      doc.text(lineasFiltroProcesadas, 40, 90);

      // 3. CONSTRUIRE LA TABLA CON EL FORMATO Y PALETA DE COLORES IDENTICA
      const headers = [Object.keys(filasMapeadas[0])];
      const rows = filasMapeadas.map(obj => Object.values(obj));

      (autoTableModule as any).default(doc, {
        head: headers,
        body: rows,
        startY: 115, // Bajamos la tabla un poco para que no colisione con el bloque de filtros
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 6 },
        // Cabecera Verde Éxito idéntica al botón "Exportar" y diseño general del panel de mixtura
        headStyles: { 
          fillColor: [46, 204, 113], // Verde esmeralda vivo #2ecc71
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        // Filas alternas con el mismo sombreado gris sutil que la tabla web
        alternateRowStyles: { 
          fillColor: [245, 247, 250] 
        },
        margin: { top: 40, left: 40, right: 40, bottom: 40 }
      });

      // Guardamos el archivo PDF resultante
      doc.save(`Mis_Pedidos_Filtrados_${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(err => {
      console.error("Error cargando jsPDF / AutoTable:", err);
      this.presentToast("Error al generar el archivo PDF.");
    });
  }

  // Blanqueamos la selección para permitir próximas ejecuciones del mismo formato
  event.target.value = '';
}
}