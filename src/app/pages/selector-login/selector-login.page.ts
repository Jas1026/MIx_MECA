import { Component } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selector-login',
  templateUrl: './selector-login.page.html',
  styleUrls: ['./selector-login.page.scss'],
})
export class SelectorLoginPage {
constructor(
  private server: ServerContentService,
  private router: Router
) {}
  isMeca = false;
  email = '';
  password = '';

ngOnInit() {
  sessionStorage.clear(); // solo limpia esta pestaña
}
login() {

  sessionStorage.clear();

  const system = this.isMeca ? 'mecapos' : 'mixtura';

  this.server.LoginWithPassword(
    this.email,
    this.password,
    system
  ).subscribe(async (res: any) => {

    if (res.error === 0) {

      sessionStorage.setItem("user_id", res.id);
      sessionStorage.setItem("user_name", res.name);
      sessionStorage.setItem("system", system);
      sessionStorage.setItem("role", res.role);

      // 🔥 QUITAR FOCO
      const active = document.activeElement as HTMLElement;

      if (active) {
        active.blur();
      }

      // Esperar render
      await new Promise(resolve => setTimeout(resolve, 80));

      // Navegación correcta
      await this.router.navigate(
        ['/panel'],
        {
          replaceUrl: true
        }
      );

    } else {
      alert(res.message);
    }

  });

}
  }
  