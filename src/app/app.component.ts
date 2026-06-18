import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showFloating = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkFloating();
      });
  }

  checkFloating() {
    const userId = sessionStorage.getItem('user_id');
    const role = sessionStorage.getItem('role');

    // 1. Definimos los roles permitidos exactos coincidentes con tu Router Guard
    const rolesPermitidos = ['admin', 'mesero', 'jefe_mesero'];

    // 2. Evaluamos: Debe existir un userId activo Y el rol actual debe estar incluido en la lista permitida
    this.showFloating = !!userId && rolesPermitidos.includes(role || '');
  }
}