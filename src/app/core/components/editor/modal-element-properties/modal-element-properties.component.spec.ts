import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalElementPropertiesComponent } from './modal-element-properties.component';

describe('ModalElementPropertiesComponent', () => {
  let component: ModalElementPropertiesComponent;
  let fixture: ComponentFixture<ModalElementPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalElementPropertiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalElementPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
