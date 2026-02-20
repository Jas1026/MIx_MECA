import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBriefProductPage } from './add-brief-product.page';

describe('AddBriefProductPage', () => {
  let component: AddBriefProductPage;
  let fixture: ComponentFixture<AddBriefProductPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddBriefProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
