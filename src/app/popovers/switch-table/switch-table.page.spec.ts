import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchTablePage } from './switch-table.page';

describe('SwitchTablePage', () => {
  let component: SwitchTablePage;
  let fixture: ComponentFixture<SwitchTablePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SwitchTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
