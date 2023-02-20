import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierSignalementComponent } from './modifier-signalement.component';

describe('ModifierSignalementComponent', () => {
  let component: ModifierSignalementComponent;
  let fixture: ComponentFixture<ModifierSignalementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierSignalementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierSignalementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
