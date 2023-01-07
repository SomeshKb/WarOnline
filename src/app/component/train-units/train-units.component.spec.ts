import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainUnitsComponent } from './train-units.component';

describe('TrainUnitsComponent', () => {
  let component: TrainUnitsComponent;
  let fixture: ComponentFixture<TrainUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainUnitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
