import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallSettingsComponent } from './wall-settings.component';

describe('WallSettingsComponent', () => {
  let component: WallSettingsComponent;
  let fixture: ComponentFixture<WallSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WallSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WallSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
