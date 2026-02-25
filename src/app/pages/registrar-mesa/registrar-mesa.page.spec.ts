import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarMesaPage } from './registrar-mesa.page';

describe('RegistrarMesaPage', () => {
  let component: RegistrarMesaPage;
  let fixture: ComponentFixture<RegistrarMesaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegistrarMesaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
