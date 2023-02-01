import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistictComponent } from './distict.component';

describe('DistictComponent', () => {
  let component: DistictComponent;
  let fixture: ComponentFixture<DistictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistictComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
