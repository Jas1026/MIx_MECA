import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevolutionPage } from './devolution.page';

describe('DevolutionPage', () => {
  let component: DevolutionPage;
  let fixture: ComponentFixture<DevolutionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DevolutionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
