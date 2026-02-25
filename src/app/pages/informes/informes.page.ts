import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { ModalController } from '@ionic/angular';

// Declaramos google para que TypeScript no marque error
declare var google: any;

@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
})
export class InformesPage implements OnInit {

  resumen: any = {
    total_dinero: 0,
    activos_conteo: 0,
    top_productos: [],
    alertas_inventario: []
  };

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.cargarResumen();
    // Cargamos el paquete de gráficos de Google
    if (typeof google !== 'undefined') {
      google.charts.load('current', { 'packages': ['corechart'] });
    }
  }

  ionViewWillEnter() {
    this.cargarResumen();
  }

  cargarResumen() {
    const system = this.server.getSystem();
    this.server.getInformes(system).subscribe((res: any) => {
      if (res.error === 0) {
        this.resumen = res.resumen;
      }
    });
  }

  // Función que se dispara al abrir el modal
  dibujarGrafico() {
    if (typeof google === 'undefined' || !google.charts) return;

    // Pequeño delay para asegurar que el div del modal exista
    setTimeout(() => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Producto');
      data.addColumn('number', 'Cantidad');

      // Llenamos con los datos del servidor
      this.resumen.top_productos.forEach((p: any) => {
        data.addRow([p.nombre_producto, parseInt(p.cantidad)]);
      });

      const options = {
        title: 'Distribución de Ventas',
        pieHole: 0.4, // Estilo Dona
        chartArea: { width: '90%', height: '80%' },
        legend: { position: 'bottom' },
        colors: ['#4a3f35', '#ffc409', '#3880ff', '#10dc60', '#ff4961']
      };

      const chart = new google.visualization.PieChart(document.getElementById('donutchart'));
      chart.draw(data, options);
    }, 400);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}