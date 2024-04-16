import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsButtonComponent } from './actions-button.component';

describe('ActionsButtonComponent', () => {
  let component: ActionsButtonComponent;
  let fixture: ComponentFixture<ActionsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
