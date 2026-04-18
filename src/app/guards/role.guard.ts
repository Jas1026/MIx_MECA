import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = (sessionStorage.getItem('role') || '').toLowerCase().trim();
    
    // Obtenemos los roles permitidos para esta ruta desde la configuración del routing
    const expectedRoles = route.data['expectedRoles'];

    // Si el rol del usuario está en la lista de permitidos, adelante
    if (expectedRoles.includes(userRole)) {
      return true;
    }

    // Si no tiene permiso, lo mandamos al panel principal o al login
    console.warn('Acceso denegado: Rol insuficiente');
    this.router.navigate(['/panel']);
    return false;
  }
}