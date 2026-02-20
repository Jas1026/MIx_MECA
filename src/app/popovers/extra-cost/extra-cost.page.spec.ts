import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtraCostPage } from './extra-cost.page';

describe('ExtraCostPage', () => {
  let component: ExtraCostPage;
  let fixture: ComponentFixture<ExtraCostPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExtraCostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
