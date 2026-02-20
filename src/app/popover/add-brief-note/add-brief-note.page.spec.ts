import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBriefNotePage } from './add-brief-note.page';

describe('AddBriefNotePage', () => {
  let component: AddBriefNotePage;
  let fixture: ComponentFixture<AddBriefNotePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddBriefNotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
