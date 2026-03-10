import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';
 import { HttpClient } from '@angular/common/http';
import { AreaDetalleModalPage } from 'src/app/modals/area-detalle-modal/area-detalle-modal.page';
 
declare var google: any;
 
@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
})
export class InformesPage implements OnInit {
 
  @ViewChild('modalGraficos') modalGraficos: any;
 
  tipoFiltro: string = 'dia';
  fechaFiltro: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
 
 
pedidos: any[] = [];
 
fechaMostrada: string = '';
 
 
//gestion de calendario (fechas)
fechaInicioISO: string = '';
fechaFinISO: string = '';
 
resumen: any = {
  total_dinero: 0,
  ganancia_total: 0,
  top_productos: [],
  areas_top: [],
  horas_pico: [],
  ventas_alcohol: {},
  categoria_top: null,
  meseros_retraso: [],
  meseros: [],
  pedido_mayor_retraso: null,
  alertas_inventario: [],
  ingredientes_top: []
};
 
 
 
 
  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {}
 
ngOnInit() {
  // 1. Cargar la librería de Google Charts apenas inicie la página
  if (typeof google !== 'undefined') {
    google.charts.load('current', {
      packages: ['corechart'],
      language: 'es'
    });
  }
 
  this.limpiarFiltros();
}
 
ionViewWillEnter() {
  // Lo mismo aquí para evitar doble carga innecesaria
  this.limpiarFiltros();
}
 
  /* ==============================
     DIBUJAR GRÁFICOS
  ==============================*/
 dibujarGraficos() {
  // Verificamos que google exista y que la librería de visualización esté cargada
  if (typeof google === 'undefined' || !google.visualization) {
    console.warn("Google Charts no está listo aún.");
    return;
  }
 
  // Usamos un pequeño timeout para asegurar que los contenedores ID estén renderizados en el DOM del modal
  setTimeout(() => {
   
    /* 🔹 TOP PRODUCTOS */
    if (this.resumen.top_productos?.length) {
      const cont = document.getElementById('chartAlcohol');
      if (cont) {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Producto');
        data.addColumn('number', 'Cantidad');
 
        this.resumen.top_productos.forEach((p: any) => {
          data.addRow([p.nombre_producto, Number(p.cantidad)]);
        });
 
        new google.visualization.PieChart(cont).draw(data, {
          title: 'Top Productos',
          pieHole: 0.4,
          chartArea: { width: '90%', height: '80%' }
        });
      }
    }
 
    /* 🔹 ÁREAS */
    if (this.resumen.areas_top?.length) {
      const cont = document.getElementById('chartAreas');
      if (cont) {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Área');
        data.addColumn('number', 'Ventas');
 
        this.resumen.areas_top.forEach((a: any) => {
          data.addRow([a.area, Number(a.total_area)]);
        });
 
        new google.visualization.ColumnChart(cont).draw(data, {
          title: 'Áreas que más generan',
          legend: { position: 'none' }
        });
      }
    }
 
    /* 🔹 HORAS PICO */
    if (this.resumen.horas_pico?.length) {
      const cont = document.getElementById('chartHoras');
      if (cont) {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Hora');
        data.addColumn('number', 'Pedidos');
 
        this.resumen.horas_pico.forEach((h: any) => {
          data.addRow([h.hora + ':00', Number(h.total_pedidos)]);
        });
 
        new google.visualization.LineChart(cont).draw(data, {
          title: 'Horas Pico',
          curveType: 'function'
        });
      }
    }
 
    /* 🔹 ALCOHOL VS SIN ALCOHOL */
    if (this.resumen.ventas_alcohol) {
      const cont = document.getElementById('chartAlcoholVs');
      if (cont) {
        const data = google.visualization.arrayToDataTable([
          ['Tipo', 'Ventas'],
          ['Con Alcohol', Number(this.resumen.ventas_alcohol.con || 0)],
          ['Sin Alcohol', Number(this.resumen.ventas_alcohol.sin || 0)]
        ]);
 
        new google.visualization.PieChart(cont).draw(data, {
          title: 'Alcohol vs No Alcohol',
          pieHole: 0.4
        });
      }
    }
 
  }, 200); // 200ms es suficiente para que el modal se despliegue
}
 
  /* ==============================
     VER DETALLE ÁREA
  ==============================*/
 
  async verDetalleArea(area: any) {
 
    const modal = await this.modalCtrl.create({
      component: AreaDetalleModalPage,
      componentProps: { area }
    });
 
    await modal.present();
 
  }
 
  /* ==============================
     CERRAR MODAL
  ==============================*/
 
  cerrarModal() {
 
    this.modalCtrl.dismiss();
 
  }
 
 
  establecerRangoOperativo(fechaBase: Date) {
  // Fecha Inicio: Día seleccionado a las 05:00:00
  const inicio = new Date(fechaBase);
  inicio.setHours(5, 0, 0, 0);
 
  // Fecha Fin: Día siguiente a las 04:59:59
  const fin = new Date(fechaBase);
  fin.setDate(fin.getDate() + 1);
  fin.setHours(4, 59, 59, 999);
 
  this.fechaInicioISO = inicio.toISOString();
  this.fechaFinISO = fin.toISOString();
 
  // Para mostrar en el botón del calendario
  this.fechaMostrada = fechaBase.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
 
fechaSeleccionada(event: any) {
  const fecha = event.detail.value;
  if (fecha) {
    const date = new Date(fecha);
    // Ajustamos la fecha para evitar desfases de zona horaria al crear el objeto Date
    const userDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
   
    this.establecerRangoOperativo(userDate);
    this.tipoFiltro = "rango_operativo"; // Cambiamos el tipo para que el backend lo identifique
    this.cargarResumen();
  }
}
cargarResumen() {
  // Asegurémonos de enviar exactamente lo que el PHP pide: 'filtro', 'fecha_inicio' y 'fecha_fin'
  this.server.getResumen(
    this.tipoFiltro,
    this.fechaInicioISO,
    this.fechaFinISO
  ).subscribe((res: any) => {
    if (res && res.error === 0) {
      this.resumen = res.resumen;
      this.pedidos = res.resumen.ordenes || [];
     
      // Si el modal de gráficos está abierto, redibujamos
      if (this.modalGraficos) {
        this.dibujarGraficos();
      }
    }
  });
}
/* ==============================
     LIMPIAR FILTROS
  ==============================*/
  limpiarFiltros() {
    // 1. Reseteamos variables de filtro
    this.tipoFiltro = ''; // Al estar vacío, el PHP hará "WHERE 1=1"
    this.fechaInicioISO = '';
    this.fechaFinISO = '';
    this.fechaFiltro = '';
   
    // 2. Reseteamos la etiqueta visual
    this.fechaMostrada = 'Análisis Histórico';
 
    // 3. Recargamos los datos sin restricciones
    this.cargarResumen();
  }
}