import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRecordPage } from './table-record.page';

describe('TableRecordPage', () => {
  let component: TableRecordPage;
  let fixture: ComponentFixture<TableRecordPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TableRecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
