import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CloseCashPage } from './close-cash.page';

describe('CloseCashPage', () => {
  let component: CloseCashPage;
  let fixture: ComponentFixture<CloseCashPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CloseCashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
