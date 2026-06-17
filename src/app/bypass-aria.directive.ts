import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appBypassAria]'
})
export class BypassAriaDirective {

  constructor() {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    // 1. Desvincular inmediatamente el foco de cualquier botón activo en el menú antes de que Ionic actúe
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }

    // Fuerza el foco al elemento raíz del documento
    const body = document.querySelector('body');
    if (body) body.focus();

    // 2. Ejecutar una ráfaga de limpieza (bucle rápido) durante la transición de Ionic
    // Esto asegura atrapar el "aria-hidden" en el milisegundo exacto en que Ionic lo genera
    let ticks = 0;
    const interval = setInterval(() => {
      this.clearAriaBlockers();
      ticks++;
      if (ticks > 10) clearInterval(interval); // Limpia durante 500ms
    }, 50);
  }

  private clearAriaBlockers() {
    // Desbloquear contenedor principal
    const container = document.getElementById('main-panel-container');
    if (container) {
      container.removeAttribute('aria-hidden');
      container.classList.remove('menu-content-overlay');
      container.style.pointerEvents = 'auto';
      container.style.opacity = '1';
    }

    // Desbloquear outlets y páginas
    const elementsers = document.querySelectorAll('ion-router-outlet, .ion-page, .ion-page-hidden, ion-backdrop, .menu-backdrop');
    elementsers.forEach((el) => {
      el.removeAttribute('aria-hidden');
      if (el.classList.contains('ion-page-hidden')) {
        (el as HTMLElement).style.pointerEvents = 'none';
      } else {
        (el as HTMLElement).style.pointerEvents = 'auto';
      }
    });
  }
}