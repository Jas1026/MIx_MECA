import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CafeTablesPage } from './cafe-tables.page';

describe('CafeTablesPage', () => {
  let component: CafeTablesPage;
  let fixture: ComponentFixture<CafeTablesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CafeTablesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
