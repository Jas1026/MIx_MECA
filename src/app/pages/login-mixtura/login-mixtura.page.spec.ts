import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginMixturaPage } from './login-mixtura.page';

describe('LoginMixturaPage', () => {
  let component: LoginMixturaPage;
  let fixture: ComponentFixture<LoginMixturaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoginMixturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
