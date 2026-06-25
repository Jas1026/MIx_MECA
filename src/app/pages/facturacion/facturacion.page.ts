import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf'; // Importamos la librería para manejar PDFs en memoria

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.page.html',
  styleUrls: ['./facturacion.page.scss'],
})
export class FacturacionPage implements OnInit {
  orderId: string = '';
  detallesTotales: any[] = [];
  historialPagos: any[] = [];
  totalGeneral: number = 0;
  today: Date = new Date();
  formatoImpresion: string = 'ticket80';

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarResumenFinal();
  }

  cargarResumenFinal() {
    this.server.getOrderDetails(Number(this.orderId)).subscribe((res: any) => {
      if (res.error === 0) {
        this.detallesTotales = res.data.filter((d:any) => d.estado_pago === 'pagado');
        this.totalGeneral = this.detallesTotales.reduce((sum, item) => sum + Number(item.total_price), 0);
      }
    });

    this.server.getHistorialPagos(Number(this.orderId)).subscribe((res: any) => {
      if (res.error === 0) {
        this.historialPagos = res.data;
      }
    });
  }

  async compartirOAbrirCon() {
    const elemento = document.getElementById('factura-print');
    if (!elemento) return;

    try {
      // Capturamos el contenedor del ticket en alta resolución
      const canvas = await html2canvas(elemento, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // --- CORRECCIÓN DEFINITIVA PARA EVITAR EL ERROR 2774 ---
      let esMovilConCompartir = false;

      // 1. Verificamos si las funciones existen en el navegador
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        try {
          const dummyFile = new File([''], 'test.png', { type: 'image/png' });
          // 2. Ejecutamos la función de manera segura con sus paréntesis ()
          esMovilConCompartir = navigator.canShare({ files: [dummyFile] });
        } catch (e) {
          esMovilConCompartir = false;
        }
      }

      if (esMovilConCompartir) {
        // -------------------------------------------------------------
        // COMPORTAMIENTO EN CELULAR: Menú Compartir Nativo (PNG)
        // -------------------------------------------------------------
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const nombreArchivo = `ticket_orden_${this.orderId}.png`;
          const archivo = new File([blob], nombreArchivo, { type: 'image/png' });

          try {
            await navigator.share({
              files: [archivo],
              title: `Orden #${this.orderId}`,
              text: 'Selecciona tu app de impresión'
            });
          } catch (shareError) {
            console.log('El usuario canceló o falló el compartir nativo:', shareError);
          }
        }, 'image/png');

      } else {
        // -------------------------------------------------------------
        // COMPORTAMIENTO EN COMPUTADORA: Visor PDF temporal ("Abrir con")
        // -------------------------------------------------------------
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Convertimos los píxeles a milímetros
        const pdfWidth = imgWidth * 0.264583;
        const pdfHeight = imgHeight * 0.264583;

        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'l' : 'p',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Generamos el Blob seguro en memoria RAM
        const pdfBlobUrl = pdf.output('bloburl');

        // Abrimos el flujo del PDF en una pestaña nueva
        const nuevaVentana = window.open(pdfBlobUrl, '_blank');
        
        if (!nuevaVentana) {
          alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para procesar el ticket.');
        }
      }

    } catch (error) {
      console.error('Error al procesar la exportación del ticket:', error);
    }
  }

  volverMesas() {
    this.router.navigate(['/panel']);
  }
}