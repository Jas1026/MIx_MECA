import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
})
export class PanelPage implements OnInit {

  constructor(
    private server: ServerContentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkSession();
  }

  checkSession() {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("No hay sesión activa");
      this.router.navigate(['/selector-login']);
      return;
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/selector-login']);
  }

}
