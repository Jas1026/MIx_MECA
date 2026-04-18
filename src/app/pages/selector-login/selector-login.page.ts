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
  // ⚠️ SOLO limpiamos esta pestaña
  sessionStorage.clear();

  const system = this.isMeca ? 'mecapos' : 'mixtura';

  this.server.LoginWithPassword(this.email, this.password, system).subscribe((res: any) => {
    if (res.error === 0) {

      // ✅ Guardamos por pestaña (NO global)
      sessionStorage.setItem("user_id", res.id);
      sessionStorage.setItem("user_name", res.name);
      sessionStorage.setItem("system", system);
      sessionStorage.setItem("role", res.role);

      this.router.navigate(['/panel']);
    } else {
      alert(res.message);
    }
  });
}
  }
  