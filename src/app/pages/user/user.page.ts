import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';
import { CreateUserComponent } from '../../modals/create-user/create-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UsersPage implements OnInit {
  users: any[] = [];
  filterName: string = '';
  selectedRole: string = 'all';

  // ORDENAMIENTO
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // FILTROS POR COLUMNA
  filtros = {
    name: '',
    role: '',
    code: '',
    state: ''
  };

  // PAGINACIÓN
  paginaActual = 1;
  itemsPorPagina = 10;
  opcionesPagina = [5, 10, 20, 50];

  constructor(
    private server: ServerContentService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarUsers();
  }

  cargarUsers() {
    const system = this.server.getSystem();
    this.server.getUsers(system).subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.users = res;
      } else {
        this.users = [];
      }
    });
  }

  get filteredUsers() {
    let resultado = [...this.users];

    resultado = resultado.filter(u => {
      const matchNombre =
        !this.filterName ||
        u.name?.toLowerCase().includes(this.filterName.toLowerCase());

      const matchRol =
        this.selectedRole === 'all' ||
        u.role === this.selectedRole;

      const filtroNombre =
        !this.filtros.name ||
        u.name?.toLowerCase().includes(this.filtros.name.toLowerCase());

      const filtroRol =
        !this.filtros.role ||
        u.role?.toLowerCase().includes(this.filtros.role.toLowerCase());

      const filtroCode =
        !this.filtros.code ||
        u.code?.toLowerCase().includes(this.filtros.code.toLowerCase());

      const estadoTexto =
        (u.state == 1 || u.state == '1') ? 'activo' : 'inactivo';

      const filtroEstado =
        !this.filtros.state ||
        estadoTexto.includes(this.filtros.state.toLowerCase());

      return (
        matchNombre &&
        matchRol &&
        filtroNombre &&
        filtroRol &&
        filtroCode &&
        filtroEstado
      );
    });

    if (this.sortColumn) {
      resultado.sort((a: any, b: any) => {
        let valorA = a[this.sortColumn];
        let valorB = b[this.sortColumn];

        valorA = valorA?.toString().toLowerCase() || '';
        valorB = valorB?.toString().toLowerCase() || '';

        if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return resultado;
  }

  get totalPaginas(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPorPagina) || 1;
  }

  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.filteredUsers.slice(inicio, inicio + this.itemsPorPagina);
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
    this.filterName = '';
    this.selectedRole = 'all';
    this.filtros = {
      name: '',
      role: '',
      code: '',
      state: ''
    };
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.paginaActual = 1;
  }

  // 🔥 NUEVO MÉTODO EXPORTAR: CON DISEÑO CORPORATIVO Y FILTROS APLICADOS DETALLADOS
  exportarDatos(event: any) {
    const formato = event.detail.value;
    if (!formato) return;

    const datosAExportar = this.filteredUsers;

    if (!datosAExportar || datosAExportar.length === 0) {
      this.presentToast("No hay datos filtrados para exportar.", "danger");
      event.target.value = '';
      return;
    }

    // Mapeamos los datos purificando roles y estados para el reporte
    const filasMapeadas = datosAExportar.map((u: any) => {
      let rolLimpio = u.role;
      if (u.role === 'admin') rolLimpio = 'Administrador';
      if (u.role === 'jefe_mesero') rolLimpio = 'Jefe de Mesero';
      if (u.role === 'mesero') rolLimpio = 'Mesero';
      if (u.role === 'cocina') rolLimpio = 'Cocina';

      return {
        'Nombre Completo': u.name || 'N/A',
        'Rol asignado': rolLimpio,
        'Código / Login': u.code || 'N/A',
        'Estado': (u.state == 1 || u.state == '1') ? 'Activo' : 'Inactivo',
        'Último Acceso': u.last_loggin || 'Nunca ingresó'
      };
    });

    if (formato === 'excel') {
      import('xlsx').then((XLSX) => {
        const worksheet = XLSX.utils.json_to_sheet(filasMapeadas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

        // Autocálculo de ancho de columnas sin error 7053
        const maxProps = Object.keys(filasMapeadas[0]);
        worksheet['!cols'] = maxProps.map(prop => ({
          wch: Math.max(...filasMapeadas.map((row: any) => (row[prop] ? row[prop].toString().length : 0)).concat(prop.length)) + 3
        }));

        XLSX.writeFile(workbook, `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        const doc = new jsPDF('l', 'pt', 'a4'); // 'l' = Modo horizontal para ver el último acceso cómodo

        // 1. TÍTULO PRINCIPAL
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Color #2c3e50
        doc.text('Reporte de Gestión de Usuarios', 40, 40);

        // Subtítulo / Metadatos básicos
        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141); // Color #7f8c8d
        doc.text(`Generado el: ${new Date().toLocaleString()} | Total registros: ${filasMapeadas.length}`, 40, 55);

        // 2. EXTRACCIÓN DINÁMICA DE FILTROS ACTUADOS (Tu requerimiento)
        let stringsFiltros: string[] = [];

        // Buscador superior principal
        if (this.filterName) {
          stringsFiltros.push(`Buscar usuario: "${this.filterName}"`);
        }
        // Selector de Roles superior
        if (this.selectedRole && this.selectedRole !== 'all') {
          stringsFiltros.push(`Rol: ${this.selectedRole}`);
        } else {
          stringsFiltros.push(`Rol: Todos`);
        }
        // Filtros individuales inferiores por columna
        if (this.filtros.name) stringsFiltros.push(`Filtro Nombre: "${this.filtros.name}"`);
        if (this.filtros.role) stringsFiltros.push(`Filtro Rol: "${this.filtros.role}"`);
        if (this.filtros.code) stringsFiltros.push(`Filtro Código: "${this.filtros.code}"`);
        if (this.filtros.state) stringsFiltros.push(`Filtro Estado: "${this.filtros.state}"`);

        // Pintamos el bloque informativo de filtros en el PDF
        doc.setFontSize(10);
        doc.setTextColor(52, 73, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros activos en pantalla:', 40, 75);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 120, 130);

        const textoFiltrosUnificados = stringsFiltros.join('  •  ');
        const lineasFiltroProcesadas = doc.splitTextToSize(textoFiltrosUnificados, 760);
        doc.text(lineasFiltroProcesadas, 40, 90);

        // 3. TABLA CON DISEÑO CORPORATIVO IDENTICO (Mismo color verde éxito)
        const headers = [Object.keys(filasMapeadas[0])];
        const rows = filasMapeadas.map(obj => Object.values(obj));

        (autoTableModule as any).default(doc, {
          head: headers,
          body: rows,
          startY: 115, // Espaciado adecuado debajo del panel de filtros
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 6 },
          headStyles: {
            fillColor: [46, 204, 113], // Mismo Verde Corporativo #2ecc71
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250] // Sombreado alterno sutil
          },
          margin: { top: 40, left: 40, right: 40, bottom: 40 }
        });

        doc.save(`Reporte_Usuarios_Filtrados_${new Date().toISOString().split('T')[0]}.pdf`);
      }).catch(err => {
        console.error("Error PDF:", err);
        this.presentToast("Error al generar el archivo PDF.", "danger");
      });
    }

    event.target.value = '';
  }

  async openCreateModal(user?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateUserComponent,
      componentProps: { user: user }
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) this.cargarUsers();
    });
    return await modal.present();
  }

  async presentToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000 });
    t.present();
  }

  async toggleUserState(user: any) {
    const nuevoEstado = (user.state == 1 || user.state == '1') ? 0 : 1;
    const system = this.server.getSystem();
    
    let body = new FormData();
    body.append("id", user.id);
    body.append("state", nuevoEstado.toString());
    body.append("system", system);

    this.server.updateUserState(body).subscribe({
      next: (res: any) => {
        if (res.error === 0) {
          user.state = nuevoEstado;
          this.presentToast("Estado del usuario actualizado", "success");
        } else {
          this.presentToast("Error: " + res.message, "danger");
        }
      },
      error: (err) => {
        this.presentToast("No se pudo conectar con el servidor", "danger");
      }
    });
  }

  async eliminarUsuario(user: any) {
    const body = new FormData();
    body.append("id", user.id);
    body.append("system", this.server.getSystem());

    this.server.deleteUser(body).subscribe({
      next: (res: any) => {
        if (res.error == 0) {
          this.presentToast("Usuario eliminado", "success");
          this.cargarUsers();
        } else {
          this.presentToast(res.message, "danger");
        }
      },
      error: () => {
        this.presentToast("Error servidor", "danger");
      }
    });
  }
}