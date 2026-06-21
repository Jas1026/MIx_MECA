import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';
import { ModalController, AlertController, ToastController } from '@ionic/angular'; // 👈 Inyectamos Alert y Toast
import { IonDatetime } from '@ionic/angular';
import { OrderModalComponent } from 'src/app/components/order-modal/order-modal.component';
import { ViewOrderProductsComponent } from 'src/app/modals/view-order-products/view-order-products.component';
// 🔥 NUEVAS IMPORTACIONES PARA EXPORTAR
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  fechaMostrada: string = '';
  meseros: any[] = [];
  meseroSeleccionado: string = '';
  estadoSeleccionado: string = '';
  pedidos: any[] = [];
  filtroMesero: string = '';
  fechaFiltro: string = '';
  userRole: string = '';
  soloAtrasados: boolean = false;
  soloMasRetrasadosPrimero: boolean = false;
  private clockInterval: any;

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController, // 👈 Añadido
    private toastCtrl: ToastController   // 👈 Añadido
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();

    // Carga inicial de datos
    this.server.getWaiters().subscribe((res: any) => {
      this.meseros = res.data;
    });
    this.cargarPedidos();
    this.startClock();
  }
  ionViewWillEnter() {
    this.cargarDatosUsuario();
  }
  cargarDatosUsuario() {
    // Usamos 'role' que es la clave que sí funciona en tu Panel
    const savedRole = sessionStorage.getItem('role');
    this.userRole = savedRole ? savedRole.trim().toLowerCase() : '';

    console.log("PEDIDOS PAGE -> Rol verificado:", this.userRole);
  }
  cargarPedidos() {
    this.server.getAllOrders()
      .subscribe((res: any) => {
        if (res.error === 0) {
          this.pedidos = res.data;
        }
      });
  }

get pedidosFiltrados() {

  let filtrados = this.pedidos.filter(p => {
    // FILTRO BUSQUEDA MESERO
if (
  this.filtros.mesero &&
  !p.mesero?.toLowerCase()
      .includes(this.filtros.mesero.toLowerCase())
) {
  return false;
}

// FILTRO FECHA
if (
  this.filtros.order_date &&
  !p.order_date?.toLowerCase()
      .includes(this.filtros.order_date.toLowerCase())
) {
  return false;
}

// FILTRO ESTADO
if (
  this.filtros.status &&
  !p.status?.toLowerCase()
      .includes(this.filtros.status.toLowerCase())
) {
  return false;
}

// FILTRO TIEMPO
if (
  this.filtros.estimated_time &&
  !String(p.estimated_time)
      .includes(this.filtros.estimated_time)
) {
  return false;
}

// FILTRO ATRASO
if (
  this.filtros.delayTime &&
  !String(p.delayTime)
      .includes(this.filtros.delayTime)
) {
  return false;
}

    // ===============================
    // 1️⃣ FILTRO POR MESERO
    // ===============================
    if (this.meseroSeleccionado && p.mesero !== this.meseroSeleccionado) {
      return false;
    }

    // ===============================
    // 2️⃣ FILTRO POR ESTADO
    // ===============================
    if (this.estadoSeleccionado) {

      // CANCELADOS
      if (this.estadoSeleccionado === 'cancel' && p.cancel != 1) {
        return false;
      }

      // FINALIZADOS
      if (this.estadoSeleccionado === 'closed' &&
          (p.status !== 'closed' || p.cancel == 1)) {
        return false;
      }

      // ABIERTOS
      if (this.estadoSeleccionado === 'open' &&
          p.status !== 'open') {
        return false;
      }
    }

    // ===============================
    // 3️⃣ FILTRO FECHA
    // ===============================
    if (this.fechaFiltro) {

      const [year, month, day] =
        this.fechaFiltro.split('-').map(Number);

      const inicio =
        new Date(year, month - 1, day, 5, 0, 0, 0);

      const fin =
        new Date(year, month - 1, day + 1, 4, 59, 59, 999);

      const fechaPedido =
        new Date(p.order_date.replace(' ', 'T'));

      if (fechaPedido < inicio || fechaPedido > fin) {
        return false;
      }
    }

    // ===============================
    // 4️⃣ SOLO ATRASADOS
    // ===============================
    if (this.soloAtrasados && !p.isDelayed) {
      return false;
    }

    return true;
  });

  // ==========================================
  // 🔥 ORDENAR POR MÁS RETRASADOS
  // ==========================================
  if (this.soloMasRetrasadosPrimero) {

    filtrados = filtrados.sort((a, b) => {

      const delayA = a.isDelayed
        ? this.convertDelayToSeconds(a.delayTime)
        : -1;

      const delayB = b.isDelayed
        ? this.convertDelayToSeconds(b.delayTime)
        : -1;

      return delayB - delayA;
    });
  }
if (this.sortColumn) {

  filtrados.sort((a: any, b: any) => {

    let valorA = a[this.sortColumn];
    let valorB = b[this.sortColumn];

    if (valorA == null) valorA = '';
    if (valorB == null) valorB = '';

    if (typeof valorA === 'string') {
      valorA = valorA.toLowerCase();
      valorB = valorB.toLowerCase();
    }

    if (valorA < valorB) {
      return this.sortDirection === 'asc' ? -1 : 1;
    }

    if (valorA > valorB) {
      return this.sortDirection === 'asc' ? 1 : -1;
    }

    return 0;
  });

}
  return filtrados;
}
convertDelayToSeconds(delay: string): number {

  if (!delay) return 0;

  const parts = delay.split(':');

  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;

  return (mins * 60) + secs;
}

limpiarFecha() {
this.paginaActual = 1;
  // filtros superiores
  this.fechaFiltro = '';
  this.fechaMostrada = '';
  this.meseroSeleccionado = '';
  this.estadoSeleccionado = '';
  this.soloAtrasados = false;
  this.soloMasRetrasadosPrimero = false;

  // filtros excel
  this.filtros = {
    mesero: '',
    order_date: '',
    status: '',
    estimated_time: '',
    delayTime: ''
  };

  // ordenamiento
  this.sortColumn = '';
  this.sortDirection = 'asc';
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

  async editarPedido(p: any) {
    const modal = await this.modalCtrl.create({
      component: OrderModalComponent,
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

  // 👇 NUEVOS MÉTODOS PARA CERRAR ORDEN 👇

  async finalizarPedido(p: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cierre',
      message: `¿Estás seguro de cerrar el pedido PED-${p.order_id}? Esto liberará la mesa automáticamente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.ejecutarCierre(p.order_id);
          }
        }
      ]
    });
    await alert.present();
  }

  ejecutarCierre(id: number) {
    this.server.closeOrder_for(id).subscribe((res: any) => {
      if (res.error === 0) {
        this.presentToast("Orden finalizada y mesa liberada", "success");
        this.cargarPedidos(); // Refresca la tabla
      } else {
        this.presentToast("Error al cerrar: " + res.message, "danger");
      }
    });
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
  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
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

      const estimado = parseFloat(pedido.estimated_time || '0');

      // ===============================
      // 1️⃣ SI ESTÁ CERRADO
      // ===============================
      if (pedido.status === 'closed') {

        const actual = parseFloat(pedido.actual_time || '0'); // minutos decimales

        const minutos = Math.floor(actual);
        const segundos = Math.floor((actual - minutos) * 60);

        let delay = 0;

        if (estimado > 0 && actual > estimado) {
          delay = actual - estimado;
        }

        const delayMin = Math.floor(delay);
        const delaySec = Math.floor((delay - delayMin) * 60);

        return {
          ...pedido,
          timeDisplay: `${minutos}:${segundos.toString().padStart(2, '0')}`,
          delayTime: delay > 0
            ? `${delayMin}:${delaySec.toString().padStart(2, '0')}`
            : '0:00',
          isDelayed: delay > 0
        };
      }

      // ===============================
      // 2️⃣ SI ESTÁ ABIERTO
      // ===============================
      if (pedido.order_date) {

        const dateStr = pedido.order_date.replace(' ', 'T');
        const startTime = new Date(dateStr).getTime();
        const diffMs = now - startTime;

        if (diffMs > 0) {

          const totalSeconds = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;

          let delay = 0;

          if (estimado > 0 && mins > estimado) {
            delay = mins - estimado;
          }

          return {
            ...pedido,
            timeDisplay: `${mins}:${secs.toString().padStart(2, '0')}`,
            delayTime: delay > 0 ? `${delay}:00` : '0:00',
            isDelayed: delay > 0
          };
        }
      }

      return pedido;
    });
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


  hasRole(roleName: string): boolean {
    // Si no hay rol, no mostramos nada
    if (!this.userRole) return false;

    // Forzamos la comparación limpia
    const actualRole = this.userRole.trim().toLowerCase();
    const requiredRole = roleName.trim().toLowerCase();

    return actualRole === requiredRole;
  }
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

filtros = {
  mesero: '',
  order_date: '',
  status: '',
  estimated_time: '',
  delayTime: ''
};
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

}
paginaActual = 1;

itemsPorPagina = 10;

opcionesPagina = [10, 25, 50, 100];
get pedidosPaginados() {

  const inicio =
    (this.paginaActual - 1) * this.itemsPorPagina;

  const fin =
    inicio + this.itemsPorPagina;

  return this.pedidosFiltrados.slice(inicio, fin);
}
get totalPaginas(): number {

  return Math.ceil(
    this.pedidosFiltrados.length /
    this.itemsPorPagina
  );

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
async exportarDatos(event: any) {
    const formato = event.detail.value;
    if (!formato) return;

    // Obtenemos el universo de datos filtrados en tiempo real
    const datosParaExportar = this.pedidosFiltrados;

    if (datosParaExportar.length === 0) {
      this.presentToast("No hay registros que coincidan con los filtros para exportar.", "warning");
      event.target.value = ''; // Limpiar selección del popover
      return;
    }

    // Mapeamos los datos con un formato limpio y en español para las columnas del reporte
    const datosMapeados = datosParaExportar.map(p => {
      let estadoTexto = 'Abierto';
      if (p.cancel == 1) estadoTexto = 'Cancelado';
      else if (p.status === 'closed') estadoTexto = 'Finalizado';

      return {
        'ID Pedido': `PED-${p.order_id}`,
        'Mesero': p.mesero || 'N/A',
        'Fecha y Hora': p.order_date,
        'Estado': estadoTexto,
        'Tiempo Transcurrido / Est.': `${p.timeDisplay || '0:00'} / ${p.estimated_time} min`,
        'Atraso': p.isDelayed ? `+${p.delayTime}` : '—'
      };
    });

    const nombreArchivo = `Reporte_Pedidos_${this.fechaFiltro || 'Todos'}`;

    if (formato === 'excel') {
      // --- EXPORTACIÓN A EXCEL ---
      const worksheet = XLSX.utils.json_to_sheet(datosMapeados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
      
      // Ajuste automático del ancho de las columnas
      const maxAnios = Object.keys(datosMapeados[0]).map(key => ({
        wch: Math.max(key.length, ...datosMapeados.map(obj => obj[key as keyof typeof obj]?.toString().length || 10)) + 3
      }));
      worksheet['!cols'] = maxAnios;

      XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
      this.presentToast("Excel exportado correctamente", "success");

    } else if (formato === 'pdf') {
      // --- EXPORTACIÓN A PDF (Estilo Ejecutivo / Corporativo) ---
      const doc = new jsPDF('p', 'pt', 'a4');

      // Título principal
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 62, 80); // Color oscuro ejecutivo
      doc.text('REPORTE DE CONTROL DE PEDIDOS', 40, 50);

      // Metadatos / Filtros aplicados en el encabezado
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      
      let filtroInfo = `Fecha Filtro: ${this.fechaMostrada || 'Todas las fechas'}`;
      if (this.meseroSeleccionado) filtroInfo += ` | Mesero: ${this.meseroSeleccionado}`;
      if (this.estadoSeleccionado) filtroInfo += ` | Estado: ${this.estadoSeleccionado}`;
      
      doc.text(filtroInfo, 40, 70);
      doc.text(`Total registros: ${datosMapeados.length} pedidos encontrados`, 40, 85);
      doc.setDrawColor(220, 224, 230);
      doc.line(40, 95, 555, 95); // Línea divisoria

      // Estructurar las filas de la tabla
      const columnas = Object.keys(datosMapeados[0]);
      const filas = datosMapeados.map(obj => Object.values(obj));

      // Generación automática de la tabla
      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 110,
        theme: 'striped',
        headStyles: {
          fillColor: [44, 62, 80], // Color a juego con el Dashboard
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' }
        },
        margin: { left: 40, right: 40 }
      });

      doc.save(`${nombreArchivo}.pdf`);
      this.presentToast("PDF exportado correctamente", "success");
    }

    // Reseteamos el selector para que el usuario pueda volver a hacer click y elegir el mismo formato si lo desea
    setTimeout(() => {
      event.target.value = '';
    }, 400);
  }

}