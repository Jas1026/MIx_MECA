import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginMecaPage } from './login-meca.page';

describe('LoginMecaPage', () => {
  let component: LoginMecaPage;
  let fixture: ComponentFixture<LoginMecaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoginMecaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
