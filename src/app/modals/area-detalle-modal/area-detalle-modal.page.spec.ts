import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaDetalleModalPage } from './area-detalle-modal.page';

describe('AreaDetalleModalPage', () => {
  let component: AreaDetalleModalPage;
  let fixture: ComponentFixture<AreaDetalleModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AreaDetalleModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
