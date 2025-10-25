import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulltjornalComponent } from './bulltjornal.component';

describe('BulltjornalComponent', () => {
  let component: BulltjornalComponent;
  let fixture: ComponentFixture<BulltjornalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulltjornalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulltjornalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
