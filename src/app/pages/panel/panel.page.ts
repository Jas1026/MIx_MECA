import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
})
export class PanelPage implements OnInit {

  systemName: string = '';
  flats: any[] = [];
  kitchens: any[] = [];
  //para definir el rol
  userRole: string = '';
constructor(
  private server: ServerContentService,
  private router: Router,
  private route: ActivatedRoute
) {}

  ngOnInit() {
this.userRole = (sessionStorage.getItem('role') || '').toLowerCase();
  }
ionViewWillEnter() {
  this.checkSession();
  this.cargarRol();
}
cargarRol() {
    const role = sessionStorage.getItem('role');
    console.log("Rol detectado en el Panel:", role); // Para que verifiques en consola
    this.userRole = role ? role.toLowerCase() : '';
  }
  checkSession() {

    const userId = sessionStorage.getItem("user_id");
    const system = sessionStorage.getItem("system");

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
   this.loadKitchens();
  }

  loadFlats() {

  const system = sessionStorage.getItem("system") || '';

this.server.getFlats().subscribe((res: any) => {

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

loadKitchens() {
  this.server.getKitchens().subscribe((res: any) => {
    console.log("Kitchens:", res);

    if (res.error === 0) {
      this.kitchens = res.data;
      console.log("Primera cocina:", this.kitchens[0]);
    }
  });
}
goToKitchen(id: any) {
  console.log("Navegando a cocina:", id);
  this.router.navigate(['cocina', id], { relativeTo: this.route });
}
hasRole(roleName: string): boolean {
    // Comparamos sin importar mayúsculas/minúsculas
    return this.userRole === roleName.toLowerCase();
  }
}