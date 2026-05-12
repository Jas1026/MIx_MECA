import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KitchensPage } from './kitchens.page';

describe('KitchensPage', () => {
  let component: KitchensPage;
  let fixture: ComponentFixture<KitchensPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KitchensPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
