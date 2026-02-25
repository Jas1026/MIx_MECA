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
  localStorage.clear();
}
login() {
  localStorage.clear();
  sessionStorage.clear();
  const system = this.isMeca ? 'mecapos' : 'mixtura';

  this.server.LoginWithPassword(this.email, this.password, system).subscribe((res: any) => {
    if (res.error === 0) {
      localStorage.setItem("user_id", res.id);
      localStorage.setItem("user_name", res.name);
      localStorage.setItem("system", system);
      // GUARDAMOS EL ROL
      localStorage.setItem("role", res.role); 

      this.router.navigate(['/panel']);
    } else {
      alert(res.message);
    }
  });
}
  }
  