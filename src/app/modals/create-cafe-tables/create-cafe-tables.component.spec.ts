import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateCafeTablesComponent } from './create-cafe-tables.component';

describe('CreateCafeTablesComponent', () => {
  let component: CreateCafeTablesComponent;
  let fixture: ComponentFixture<CreateCafeTablesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCafeTablesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCafeTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
