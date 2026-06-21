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
  anioSeleccionado = new Date().getFullYear();

  // Gestión de calendario (fechas)
  fechaInicioISO: string = '';
  fechaFinISO: string = '';

  // Objeto estructurado para responder perfectamente a todo el HTML provisto
  resumen: any = {
    total_ventas: 0,
    total_pedidos: 0,
    ganancia_total: 0,
    ganancia_anual: 0,
    mesa_top: null,
    mesa_low: null,
    mesero_top: null,
    meseros: [],
    areas_top: [],
    empleados_pagos: [],
    ventas_categorias: [],
    ventas_subcategorias: [],
    top_alcohol_productos: [],
    categoria_top: null,
    ingredientes_top: [],
    horas_pico: [],
    top_productos: [],
    producto_top: null,
    producto_low: null,
    stock_minimo: null,
    ordenes_tiempo: null,
    ventas_alcohol: {}
  };
// --- NUEVAS VARIABLES PARA EL ASISTENTE IA ---
isChatOpen: boolean = false;
chatMessage: string = '';
lastContext: 'mesero' | 'ventas' | 'areas' | '' = ''; // <-- MEMORIA DE CONTEXTO CONTIGUO
chatHistory: Array<{ sender: 'user' | 'ia', text: string, timestamp: Date }> = [
  { sender: 'ia', text: '¡Hola de nuevo! Soy tu asistente de informes. He sincronizado los datos de Mixtura. ¿De qué te gustaría hablar hoy?', timestamp: new Date() }
];
  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Cargar la librería de Google Charts apenas inicie la página
    if (typeof google !== 'undefined') {
      google.charts.load('current', {
        packages: ['corechart'],
        language: 'es'
      });
    }
    this.limpiarFiltros();
  }

  ionViewWillEnter() {
    this.limpiarFiltros();
  }

  /* ==============================
     DIBUJAR GRÁFICOS (Actualizado con todos los IDs del Modal nuevo)
  ==============================*/
  dibujarGraficos() {
    if (typeof google === 'undefined' || !google.visualization) {
      console.warn("Google Charts no está listo aún.");
      return;
    }

    // Pequeño timeout para asegurar la correcta renderización del modal en el DOM
    setTimeout(() => {

      /* 🔹 1. CONSUMO DE ALCOHOL (chartAlcohol) -> Utiliza top_productos */
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
            title: 'Top Productos Destacados',
            pieHole: 0.4,
            chartArea: { width: '90%', height: '80%' }
          });
        }
      }

      /* 🔹 2. RENDIMIENTO POR ÁREA (chartAreas) */
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

      /* 🔹 3. HORAS PICO (chartHoras) */
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
            title: 'Flujo de Pedidos por Hora',
            curveType: 'function',
            legend: { position: 'bottom' }
          });
        }
      }

      /* 🔹 4. GANANCIAS POR ÁREA (chartGananciasArea) */
      if (this.resumen.areas_top?.length) {
        const cont = document.getElementById('chartGananciasArea');
        if (cont) {
          const data = new google.visualization.DataTable();
          data.addColumn('string', 'Área');
          data.addColumn('number', 'Ganancia');

          this.resumen.areas_top.forEach((a: any) => {
            data.addRow([a.area, Number(a.total_area)]); // Mapea las ganancias/ingresos por área
          });

          new google.visualization.BarChart(cont).draw(data, {
            title: 'Comparativa de Ingresos Directos',
            chartArea: { width: '50%' },
            hAxis: { title: 'Total Bs', minValue: 0 }
          });
        }
      }

      /* 🔹 5. ALCOHOL VS NO ALCOHOL (chartAlcoholVs) */
      if (this.resumen.ventas_alcohol) {
        const cont = document.getElementById('chartAlcoholVs');
        if (cont) {
          const data = google.visualization.arrayToDataTable([
            ['Tipo', 'Ventas'],
            ['Con Alcohol', Number(this.resumen.ventas_alcohol.con || 0)],
            ['Sin Alcohol', Number(this.resumen.ventas_alcohol.sin || 0)]
          ]);

          new google.visualization.PieChart(cont).draw(data, {
            title: 'Participación en Ventas',
            pieHole: 0.4
          });
        }
      }

      /* 🔹 6. PEDIDOS ATRASADOS (chartAtrasados) -> Utiliza ordenes_tiempo */
      if (this.resumen.ordenes_tiempo) {
        const cont = document.getElementById('chartAtrasados');
        if (cont) {
          const data = google.visualization.arrayToDataTable([
            ['Estado', 'Cantidad'],
            ['A tiempo', Number(this.resumen.ordenes_tiempo.a_tiempo || 0)],
            ['Retrasadas', Number(this.resumen.ordenes_tiempo.retrasadas || 0)]
          ]);

          new google.visualization.PieChart(cont).draw(data, {
            title: 'Cumplimiento de Tiempos',
            colors: ['#2dd36f', '#eb445a'] // Verde para a tiempo, Rojo para retrasadas
          });
        }
      }

    }, 300); // Se amplió levemente a 300ms para asegurar la estabilidad de carga de los 6 gráficos
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

  /* ==============================
     OPERACIONES DE FILTRADO Y TIEMPO
  ==============================*/
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

    // Visualización en el calendario
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
      const userDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

      this.establecerRangoOperativo(userDate);
      this.tipoFiltro = "rango_operativo"; 
      this.cargarResumen();
    }
  }

  cargarResumen() {
    this.server.getResumen(
      this.tipoFiltro,
      this.fechaInicioISO,
      this.fechaFinISO
    ).subscribe((res: any) => {
      if (res && res.error === 0) {
        this.resumen = res.resumen;
        this.pedidos = res.resumen.ordenes || [];

        // Si el modal de gráficos está abierto al actualizar datos, redibujamos automáticamente
        if (this.modalGraficos) {
          this.dibujarGraficos();
        }
      }
    });
  }

  limpiarFiltros() {
    this.tipoFiltro = ''; 
    this.fechaInicioISO = '';
    this.fechaFinISO = '';
    this.fechaFiltro = '';
    this.fechaMostrada = 'Análisis Histórico';

    this.cargarResumen();
    this.cargarResumenAnual(); // Sincroniza la ganancia anual por defecto al limpiar
  }

  /* ==============================
     CONTROLES ANUALES
  ==============================*/
  anioAnterior() {
    this.anioSeleccionado--;
    this.cargarResumenAnual();
  }

  anioSiguiente() {
    if (this.anioSeleccionado < new Date().getFullYear()) {
      this.anioSeleccionado++;
      this.cargarResumenAnual();
    }
  }

  cargarResumenAnual() {
    this.server.obtenerGananciaAnual(this.anioSeleccionado)
      .subscribe({
        next: (resp: any) => {
          console.log(resp);
          // Sincronizado dinámicamente con la propiedad enlazada en el HTML (resumen.ganancia_anual)
          this.resumen.ganancia_anual = Number(resp.resumen?.ganancia_total) || 0;
        },
        error: (err: Error) => {
          console.log(err);
          this.resumen.ganancia_anual = 0;
        }
      });
  }
  // Alternar apertura/cierre del panel flotante
toggleChat() {
  this.isChatOpen = !this.isChatOpen;
}
procesarPreguntaIA() {
  if (!this.chatMessage.trim()) return;

  const userQuery = this.chatMessage.trim();
  this.chatHistory.push({ sender: 'user', text: userQuery, timestamp: new Date() });
  this.chatMessage = '';

  const normalizar = (txt: string) => {
    return txt.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim();
  };

  const q = normalizar(userQuery);
  let respuesta = '';

  // ==========================================================================
  // 1. RESTRICCIONES DE CORTESÍA / INTERACCIÓN HUMANA
  // ==========================================================================
  const saludos = ['hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches', 'asistente', 'ayuda'];
  const agradecimientos = ['gracias', 'de nada', 'excelente', 'perfecto', 'buenisimo', 'ok', 'vale'];
  const despedidas = ['adios', 'chao', 'hasta luego', 'nos vemos', 'cerrar'];

  if (saludos.some(s => q === s || q.startsWith(s + ' '))) {
    respuesta = `¡Hola! 👋 Qué gusto saludarte. Estoy listo para auditar los datos actuales de Mixtura. ¿Qué métrica o rendimiento del personal te gustaría revisar?`;
  } 
  else if (agradecimientos.some(a => q.includes(a))) {
    respuesta = `¡Con muchísimo gusto! 😊 Es un placer ayudarte a controlar el negocio. ¿Hay algún otro dato o reporte que quieras que analicemos juntos?`;
  }
  else if (despedidas.some(d => q.includes(d))) {
    respuesta = `¡Hasta luego! Regresa cuando quieras revisar más números. Si deseas cerrar la ventana por completo, puedes pulsar el botón "Cerrar Panel" o minimizarme abajo.`;
  }

  // ==========================================================================
  // 2. CONTEXTOS DE RENTABILIDAD Y VENTAS GENERALES
  // ==========================================================================
  else if (q.includes('ganancia') || q.includes('venta') || q.includes('ingreso') || q.includes('recaudado') || q.includes('dinero')) {
    this.lastContext = 'ventas';
    
    if (q.includes('anual') || q.includes('ano')) {
      const gAnual = this.resumen?.ganancia_anual || 0;
      respuesta = `La **Ganancia Anual** registrada para el año activo (${this.anioSeleccionado}) es de **Bs. ${gAnual.toLocaleString('es-BO', {minimumFractionDigits: 2})}**. Puedes verla y navegar entre años usando las flechas en la tarjeta superior derecha de tu Dashboard.`;
    } else {
      const totalV = this.resumen?.total_ventas || 0;
      const gananciaR = this.resumen?.ganancia_total || 0;
      respuesta = `Actualmente en el periodo seleccionado tenemos un volumen de **Ventas Totales** de **Bs. ${totalV.toLocaleString('es-BO')}** con una **Ganancia Real (Neta)** de **Bs. ${gananciaR.toLocaleString('es-BO', {minimumFractionDigits: 2})}**.\n\n📍 *Ubicación:* Estas tarjetas encabezan el Dashboard principal.`;
    }
  }

  // ==========================================================================
  // 3. CONTEXTO DE PERSONAL / MESEROS (Gestión de ventas e ítems)
  // ==========================================================================
  else if (q.includes('mesero') || q.includes('empleado') || q.includes('personal') || q.includes('atendio')) {
    this.lastContext = 'mesero';

    if (q.includes('mejor') || q.includes('top') || q.includes('mas vende') || q.includes('ganador') || q.includes('#1')) {
      if (this.resumen?.mesero_top?.name) {
        const m = this.resumen.mesero_top;
        respuesta = `🥇 El mejor mesero del periodo es **${m.name}** con un puntaje de **${m.score || 0}**. Ha generado **Bs. ${Number(m.total_ventas).toLocaleString('es-BO')}** atendiendo **${m.pedidos_atendidos || 0} pedidos** y vendiendo **${m.items_vendidos || 0} ítems**.\n\n📍 *Ubicación:* Tarjeta morada "🏆 MEJOR MESERO" a la derecha de la mesa top.`;
      } else {
        respuesta = `Por el momento no tengo un mesero destacado en el rango actual. Puedes validar el listado completo bajando hasta la sección "💳 Gestión de Ventas por Personal" en este mismo panel.`;
      }
    } 
    else if (q.includes('peor') || q.includes('menos') || q.includes('bajo')) {
      // Tomamos la lista de meseros excluyendo al primero si la API los devuelve ordenados
      const deBaja = this.resumen.meseros || [];
      if (deBaja.length > 1) {
        const mBajo = deBaja[deBaja.length - 1];
        respuesta = `El mesero con menor volumen de venta registrado en este periodo es **${mBajo.name}** con un acumulado de **Bs. ${Number(mBajo.total_ventas).toLocaleString('es-BO')}**. Puedes ver el ranking completo de menor rendimiento al fondo del panel en la tarjeta "Meseros con Menor Venta".`;
      } else {
        respuesta = `No registro bajo rendimiento crítico aislado en el corte actual. Todos los empleados activos figuran en la sección baja del dashboard.`;
      }
    } 
    else {
      // Info general sobre los métodos de pago de los empleados
      const empCont = this.resumen.empleados_pagos?.length || 0;
      respuesta = `Tengo el desglose de caja de **${empCont} empleados** con sus respectivos cobros en Efectivo, QR y Tarjeta. Si buscas a alguien en específico, desplázate a la sección central del panel bajo el título "💳 Gestión de Ventas por Personal".`;
    }
  }

  // ==========================================================================
  // 4. CONTEXTO DE PRODUCTOS / CATEGORÍAS (Estrellas, Stock, Alcohol)
  // ==========================================================================
  else if (q.includes('producto') || q.includes('comida') || q.includes('bebida') || q.includes('inventario') || q.includes('stock') || q.includes('categoria')) {
    this.lastContext = 'areas';

    if (q.includes('estrella') || q.includes('mas vendido') || q.includes('top') || q.includes('popular')) {
      const pTop = this.resumen?.producto_top;
      const catTop = this.resumen?.categoria_top;
      
      let detalle = '';
      if (pTop?.nombre_producto) {
        detalle += `El producto estrella global es el **${pTop.nombre_producto}** con **${pTop.total_sold || pTop.total_vendido || 0} unidades vendidas**. `;
      }
      if (catTop) {
        detalle += `Asimismo, la categoría más rentable es **${catTop.nombre}** (generando Bs. ${Number(catTop.ganancia_total).toLocaleString('es-BO')}), impulsada fuertemente por su propio producto insignia: **${catTop.producto_mas_vendido}** (${catTop.cantidad_vendida} unidades).`;
      }

      respuesta = detalle ? detalle : `No tengo un producto marcado como estrella en este rango. Revisa el listado "Top 5 Productos Más Vendidos" en la sección inferior del dashboard.`;
    } 
    else if (q.includes('menos vendido') || q.includes('bajo') || q.includes('no sale')) {
      const pLow = this.resumen?.producto_low;
      if (pLow?.nombre_producto) {
        respuesta = `El producto con menor demanda global actualmente es **${pLow.nombre_producto}** con apenas **${pLow.total_vendido || 0} ventas**. Está ubicado en el bloque inferior de estatus analítico en color rojo.`;
      } else {
        respuesta = `No hay un producto crítico con bajas ventas reportado en este corte.`;
      }
    }
    else if (q.includes('stock') || q.includes('inventario') || q.includes('falta') || q.includes('critico') || q.includes('minimo')) {
      const st = this.resumen?.stock_minimo;
      if (st?.nombre) {
        respuesta = `⚠️ **¡Alerta de Inventario Crítico!** El producto con menor existencias es **${st.nombre}**. Solo quedan **${st.stock_act} ${st.unidad_med}** disponibles en almacén. Te sugiero reponerlo pronto.\n\n📍 *Ubicación:* Tarjeta "INVENTARIO CRÍTICO" abajo a la izquierda.`;
      } else {
        respuesta = `¡Buenas noticias! El sistema no reporta alertas de stock crítico o productos en mínimos para este filtro.`;
      }
    }
    else if (q.includes('alcohol')) {
      const alc = this.resumen?.ventas_alcohol;
      respuesta = `Tenemos registrado el flujo de bebidas. En el panel de gráficos avanzados (botón superior 'Análisis') puedes ver la torta de participación porcentual de "Alcohol vs No Alcohol" con los montos exactos de Bs. ${alc?.con || 0} con alcohol y Bs. ${alc?.sin || 0} sin alcohol.`;
    }
  }

  // ==========================================================================
  // 5. MESAS Y ÁREAS (Zonas del Restaurante)
  // ==========================================================================
  else if (q.includes('mesa') || q.includes('area') || q.includes('piso') || q.includes('zona')) {
    this.lastContext = 'areas';

    if (q.includes('activa') || q.includes('mejor') || q.includes('mas genera')) {
      const mTop = this.resumen?.mesa_top;
      if (mTop?.nombre) {
        respuesta = `🏆 La mesa más activa es **${mTop.nombre}** (Ubicada en: *${mTop.piso || 'Sin Piso'}*). Ha procesado **${mTop.total_pedidos || 0} pedidos** alojando un histórico de ${mTop.persons || 0} personas, acumulando un total de **Bs. ${Number(mTop.total_ventas).toLocaleString('es-BO')}** en ventas.`;
      } else {
        respuesta = `No dispongo de una mesa Top registrada en este rango exacto de tiempo.`;
      }
    }
    else if (q.includes('menos activa') || q.includes('peor') || q.includes('fria')) {
      const mLow = this.resumen?.mesa_low;
      if (mLow?.nombre) {
        respuesta = `La mesa con menor flujo transaccional y operativo es **${mLow.nombre}**, registrando únicamente **${mLow.total_pedidos || 0} pedidos**. Te recomiendo evaluar si requiere mejor atención o cambio de posición.\n\n📍 *Ubicación:* Tarjeta gris "Mesa Menos Activa" al fondo a la izquierda.`;
      } else {
        respuesta = `No hay reportes de mesas con rendimiento inusualmente bajo en este filtro.`;
      }
    }
    else {
      const topAreas = this.resumen.areas_top || [];
      respuesta = `Tengo registradas **${topAreas.length} áreas principales** generadoras de ingresos en Mixtura. La zona con mayor empuje la puedes examinar en la lista intermedia "📊 Áreas que más generan", e incluso dar clic al botón "Ver" para abrir el desglose individual.`;
    }
  }

  // ==========================================================================
  // 6. DETECCIÓN DE FECHAS / FILTROS EN TIEMPO REAL
  // ==========================================================================
  else if (q.includes('ayer') || q.includes('hoy') || q.includes('fecha') || q.includes('filtro') || q.includes('cuando')) {
    respuesta = `Actualmente estás auditando el rango: **"${this.fechaMostrada || 'Análisis Histórico'}"**. Toda la información que te proveo de meseros, mesas y productos cambia dinámicamente según lo que selecciones arriba en el botón "Rango de Consulta" 📅.`;
  }

  // ==========================================================================
  // 7. HORAS PICO Y TIEMPOS DE ENTREGA
  // ==========================================================================
  else if (q.includes('hora') || q.includes('pico') || q.includes('tiempo') || q.includes('tarde') || q.includes('retraso')) {
    if (q.includes('hora') || q.includes('pico')) {
      const hp = this.resumen?.horas_pico || [];
      if (hp.length > 0) {
        respuesta = `🔥 Analizando las **Horas Pico**: El intervalo de mayor volumen es a las **${hp[0].hora}:00 hrs** con **${hp[0].total_pedidos} operaciones** y una recaudación de **Bs. ${Number(hp[0].total_ventas).toLocaleString('es-BO')}** en esa hora sola. Puedes ver el top cronológico completo en la tabla "Análisis de Horas Pico".`;
      } else {
        respuesta = `No tengo cargado el flujo horario detallado para este filtro específico.`;
      }
    } else {
      const od = this.resumen?.ordenes_tiempo;
      respuesta = `⏱️ **Rendimiento de Órdenes:** En este periodo registramos **${od?.a_tiempo || 0} órdenes entregadas a tiempo** y **${od?.retrasadas || 0} órdenes con retraso crítico**. Si notas retrasos altos, vale la pena auditar la cocina.`;
    }
  }

  // ==========================================================================
  // MEMORIA DE APOYO / CAJA DE RESPUESTA DEFAULT CONTEXTUALIZADA
  // ==========================================================================
  else {
    if (this.lastContext === 'mesero') {
      respuesta = `No entendí bien esa consulta sobre el personal. Hablábamos de los meseros; puedes preguntarme: "¿Quién es el que más vende?" o quién tiene el puntaje más alto.`;
    } else if (this.lastContext === 'ventas') {
      respuesta = `No logré asociar eso con los números financieros. Recuerda que puedo darte la ganancia anual, la ganancia real neta, o los montos totales cobrados por tarjeta y QR. ¿Qué revisamos?`;
    } else {
      respuesta = `Disculpa, no logré interpretar esa pregunta con precisión. 🤖 Como tu Auditor de Mixtura, puedes consultarme cosas como:\n\n* *"¿Quién es el mejor mesero?"*\n* *"¿Cuál es el producto estrella o el stock crítico?"*\n* *"¿Qué área da más dinero o cuáles son las horas pico?"*`;
    }
  }

  // Desencadenar la respuesta simulando un delay humano natural
  setTimeout(() => {
    this.chatHistory.push({ sender: 'ia', text: respuesta, timestamp: new Date() });
    
    // Auto-scroll adaptativo al último mensaje
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-conversation-body');
      if (chatBody) { 
        chatBody.scrollTo({
          top: chatBody.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }, 450);
}
}
