import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular';
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
  private route: ActivatedRoute,
  private menu: MenuController
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

  sessionStorage.clear();

  this.router.navigate(
    ['/selector-login'],
    {
      replaceUrl: true
    }
  );

}
async goToFlat(id: any) {

  await this.menu.close();

  const active = document.activeElement as HTMLElement;

  if (active) {
    active.blur();
  }

  setTimeout(() => {

    this.router.navigate(
      ['/panel/mesas', id]
    );

  }, 100);

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
async goToKitchen(id: any) {

  await this.menu.close();

  const active = document.activeElement as HTMLElement;

  if (active) {
    active.blur();
  }

  setTimeout(() => {

    this.router.navigate(
      ['/panel/cocina', id]
    );

  }, 100);

}
hasRole(roleName: string): boolean {
    // Comparamos sin importar mayúsculas/minúsculas
    return this.userRole === roleName.toLowerCase();
  }
  removeFocus(event: any) {

  const target = event.target as HTMLElement;

  if (target) {
    target.blur();
  }

}
onMenuOpen() {

  setTimeout(() => {

    const backdrop = document.querySelector('ion-backdrop') as HTMLElement;

    if (backdrop) {
      backdrop.blur();
      backdrop.removeAttribute('aria-hidden');
    }

  }, 50);

}

onMenuClose() {

  setTimeout(() => {

    const active = document.activeElement as HTMLElement;

    if (active) {
      active.blur();
    }

  }, 50);

}
}