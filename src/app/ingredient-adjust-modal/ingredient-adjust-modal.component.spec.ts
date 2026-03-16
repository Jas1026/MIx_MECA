import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IngredientAdjustModalComponent } from './ingredient-adjust-modal.component';

describe('IngredientAdjustModalComponent', () => {
  let component: IngredientAdjustModalComponent;
  let fixture: ComponentFixture<IngredientAdjustModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IngredientAdjustModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientAdjustModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
