import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickerSelectorComponent } from './ticker-selector.component';

describe('TickerSelectorComponent', () => {
  let component: TickerSelectorComponent;
  let fixture: ComponentFixture<TickerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickerSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TickerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
