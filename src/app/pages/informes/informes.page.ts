import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';
 
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

meseroSeleccionado: string = '';
estadoSeleccionado: string = '';
soloAtrasados: boolean = false;

fechaMostrada: string = '';











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
    private modalCtrl: ModalController
  ) {}
 
  ngOnInit() {
 
    this.cargarResumen();
 
    if (typeof google !== 'undefined') {
      google.charts.load('current', { packages: ['corechart'] });
    }
 
  }
 
  ionViewWillEnter() {
    this.cargarResumen();
  }
 
 
 
 
 
  /* ==============================
     CARGAR DATOS DESDE BACKEND
  ==============================*/
 
  cargarResumen() {
 
    const system = this.server.getSystem();
 
    console.log("FILTROS ENVIADOS", {
      filtro: this.tipoFiltro,
      fecha: this.fechaFiltro,
      inicio: this.fechaInicio,
      fin: this.fechaFin
    });
 
    this.server.getInformes(
      system,
      this.tipoFiltro,
      this.fechaFiltro,
      this.fechaInicio,
      this.fechaFin
    ).subscribe((res: any) => {
 
      console.log("RESPUESTA BACKEND:", res);
 
      if (res.error === 0) {
 
        this.resumen = res.resumen;
 
        this.dibujarGraficos();
 
      } else {
 
        console.error("ERROR BACKEND", res);
 
      }
 
    }, (error) => {
 
      console.error("ERROR HTTP:", error);
 
    });
 
  }
 
 
  /* ==============================
     DIBUJAR GRÁFICOS
  ==============================*/
 
  dibujarGraficos() {
 
    if (typeof google === 'undefined') return;
 
    google.charts.setOnLoadCallback(() => {
 
      setTimeout(() => {
 
        /* 🔹 TOP PRODUCTOS */
 
        if (this.resumen.top_productos?.length) {
 
          const cont = document.getElementById('chartAlcohol');
 
          if (cont) {
 
            const data = new google.visualization.DataTable();
 
            data.addColumn('string', 'Producto');
            data.addColumn('number', 'Cantidad');
 
            this.resumen.top_productos.forEach((p: any) => {
 
              data.addRow([
                p.nombre_producto,
                Number(p.cantidad)
              ]);
 
            });
 
            new google.visualization.PieChart(cont).draw(data, {
              title: 'Top Productos',
              pieHole: 0.4
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
 
              data.addRow([
                a.area,
                Number(a.total_area)
              ]);
 
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
 
              data.addRow([
                h.hora + ':00',
                Number(h.total_pedidos)
              ]);
 
            });
 
            new google.visualization.LineChart(cont).draw(data, {
              title: 'Horas Pico'
            });
 
          }
 
        }
 
        /* 🔹 ALCOHOL VS SIN ALCOHOL */
 
        if (this.resumen.ventas_alcohol) {
 
          const cont = document.getElementById('chartAlcoholVs');
 
          if (cont) {
 
            const data = new google.visualization.DataTable();
 
            data.addColumn('string', 'Tipo');
            data.addColumn('number', 'Ventas');
 
            data.addRow([
              'Con Alcohol',
              Number(this.resumen.ventas_alcohol.con)
            ]);
 
            data.addRow([
              'Sin Alcohol',
              Number(this.resumen.ventas_alcohol.sin)
            ]);
 
            new google.visualization.PieChart(cont).draw(data, {
              title: 'Alcohol vs No Alcohol',
              pieHole: 0.4
            });
 
          }
 
        }
        /* 🔹 CATEGORÍA MÁS RENTABLE */
        if (this.resumen.categoria_top) {
          const cont = document.getElementById('chartGananciasArea');
          if (cont) {
            const data = new google.visualization.DataTable();
            data.addColumn('string', 'Categoría');
            data.addColumn('number', 'Ganancia');
            data.addRow([
              this.resumen.categoria_top.name,
              Number(this.resumen.categoria_top.total_ganancia)
            ]);
 
            new google.visualization.ColumnChart(cont).draw(data, {
              title: 'Categoría Más Rentable',
              legend: { position: 'none' }
            });
          }
        }
      }, 400);
    });
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










   get pedidosFiltrados() {
  return this.pedidos.filter(p => {

    // ===============================
    // 1️⃣ FILTRO POR MESERO
    // ===============================
    if (this.meseroSeleccionado && p.mesero !== this.meseroSeleccionado) {
      return false;
    }

    // ===============================
    // 2️⃣ FILTRO POR ESTADO
    // ===============================

// ===============================
// 2️⃣ FILTRO POR ESTADO
// ===============================

if (this.estadoSeleccionado) {

  // CANCELADOS
  if (this.estadoSeleccionado === 'cancel' && p.cancel != 1) {
    return false;
  }

  // FINALIZADOS
  if (this.estadoSeleccionado === 'closed' && (p.status !== 'closed' || p.cancel == 1)) {
    return false;
  }

  // ABIERTOS
  if (this.estadoSeleccionado === 'open' && p.status !== 'open') {
    return false;
  }

}

    // ===============================
    // 3️⃣ FILTRO POR DÍA OPERATIVO (5AM - 4:59AM)
    // ===============================
    if (this.fechaFiltro) {

      // Separar manualmente año, mes y día
      const [year, month, day] = this.fechaFiltro.split('-').map(Number);

      // Inicio del día operativo (5:00 AM hora local)
      const inicio = new Date(year, month - 1, day, 5, 0, 0, 0);

      // Fin del día operativo (4:59:59 del día siguiente)
      const fin = new Date(year, month - 1, day + 1, 4, 59, 59, 999);

      // Convertir fecha del pedido correctamente
      const fechaPedido = new Date(p.order_date.replace(' ', 'T'));

      if (fechaPedido < inicio || fechaPedido > fin) {
        return false;
      }
    }

    // ===============================
    // 4️⃣ FILTRO SOLO ATRASADOS
    // ===============================
    if (this.soloAtrasados && !p.isDelayed) {
      return false;
    }

    return true;
  });
}

  limpiarFecha() {
    this.fechaFiltro = '';
    this.fechaMostrada = '';
  }


   /* ==============================
     SELECCIONAR FECHA DEL CALENDARIO
  ==============================*/
 

fechaSeleccionada(event: any) {

  const fecha = event.detail.value;

  if (fecha) {

    const fechaFormateada = new Date(fecha)
      .toISOString()
      .split('T')[0];

    this.fechaFiltro = fechaFormateada;
    this.fechaMostrada = fechaFormateada;

    this.tipoFiltro = "fecha";

    this.cargarResumen();
  }

}
}