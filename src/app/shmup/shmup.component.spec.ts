import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShmupComponent } from './shmup.component';

describe('ShmupComponent', () => {
  let component: ShmupComponent;
  let fixture: ComponentFixture<ShmupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShmupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShmupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
