import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorLoginPage } from './selector-login.page';

describe('SelectorLoginPage', () => {
  let component: SelectorLoginPage;
  let fixture: ComponentFixture<SelectorLoginPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectorLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
