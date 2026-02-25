import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlatsPage } from './flats.page';

describe('FlatsPage', () => {
  let component: FlatsPage;
  let fixture: ComponentFixture<FlatsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FlatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
