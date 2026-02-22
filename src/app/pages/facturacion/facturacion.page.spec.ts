import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacturacionPage } from './facturacion.page';

describe('FacturacionPage', () => {
  let component: FacturacionPage;
  let fixture: ComponentFixture<FacturacionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FacturacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
