import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosUnitariosPage } from './pedidos-unitarios.page';

describe('PedidosUnitariosPage', () => {
  let component: PedidosUnitariosPage;
  let fixture: ComponentFixture<PedidosUnitariosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PedidosUnitariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
