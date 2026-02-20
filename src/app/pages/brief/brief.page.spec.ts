import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BriefPage } from './brief.page';

describe('BriefPage', () => {
  let component: BriefPage;
  let fixture: ComponentFixture<BriefPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BriefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
