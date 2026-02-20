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


login() {

  // 1️⃣ Definir sistema
  if (this.isMeca) {
    this.server.setSystem('meca');
  } else {
    this.server.setSystem('mixtura');
  }

  // 2️⃣ Llamar API real
this.server.LoginWithPassword(
  this.email,
  this.password,
  this.isMeca ? 'meca' : 'mixtura'
)
    .subscribe((res: any) => {

      if (res.error === 0) {

        localStorage.setItem("token", res.token);
        localStorage.setItem("user_id", res.id);
        localStorage.setItem("user_name", res.name);
        localStorage.setItem("system", this.isMeca ? "meca" : "mixtura");

        this.router.navigate(['/panel']);

      } else {
        alert(res.message);
      }

    });
}
  }
  