import { Component } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-selector-login',
  templateUrl: './selector-login.page.html',
  styleUrls: ['./selector-login.page.scss'],
})
export class SelectorLoginPage {

  isMeca = false;
  email = '';
  password = '';

  constructor(
    private server: ServerContentService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    sessionStorage.clear();
  }

  // 🛠️ Forzamos a quitar el foco de CUALQUIER elemento antes de salir de la vista
  ionViewWillLeave() {
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }
  }

  login() {
    // ✅ Quita el focus de cualquier botón/input de forma inmediata
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }

    // ⚠️ Limpia solo esta pestaña
    sessionStorage.clear();

    const system = this.isMeca ? 'mecapos' : 'mixtura';

    this.server.LoginWithPassword(
      this.email,
      this.password,
      system
    ).subscribe({

      next: (res: any) => {

        if (res.error === 0) {

          // ✅ Guardar sesión
          sessionStorage.setItem('user_id', res.id);
          sessionStorage.setItem('user_name', res.name);
          sessionStorage.setItem('system', system);
          sessionStorage.setItem('role', res.role);

          // ✅ Pequeño delay de 100ms para asegurar que Ionic limpie el árbol DOM/ARIA
          setTimeout(() => {
            
            // ✅ Navegación limpia a la raíz del panel, permitiendo el mapeo de subrutas
            this.navCtrl.navigateRoot('/panel');

          }, 100);

        } else {
          alert(res.message);
        }
      },

      error: (err) => {
        console.error(err);
        alert('Error de conexión');
      }

    });
  }
}