import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
})
export class PanelPage implements OnInit {

  systemName: string = '';
  flats: any[] = [];

  constructor(
    private server: ServerContentService,
    private router: Router
  ) {}

  ngOnInit() {

  }
ionViewWillEnter() {
  this.checkSession();
}
  checkSession() {

    const userId = localStorage.getItem("user_id");
    const system = localStorage.getItem("system");

    if (!userId || !system) {
      alert("No hay sesión activa");
      this.router.navigate(['/selector-login']);
      return;
    }

    // Mostrar nombre del sistema arriba
    if (system === 'mixtura') {
      this.systemName = 'MIXTURA';
    } else {
      this.systemName = 'MECAPOS';
    }

    this.loadFlats();
  }

  loadFlats() {

  const system = localStorage.getItem("system") || '';

  this.server.getFlats(system).subscribe((res: any) => {

    console.log("Flats completos:", res);

    if (res.error === 0) {
      this.flats = res.data;
      console.log("Primer flat:", this.flats[0]);
    } else {
      alert(res.message);
    }

  });

}

  logout() {
    localStorage.clear();
    this.router.navigate(['/selector-login']);
  }
goToFlat(id: any) {
  console.log("ID que envío:", id);
  this.router.navigate(['panel/mesas', id]);
}
}