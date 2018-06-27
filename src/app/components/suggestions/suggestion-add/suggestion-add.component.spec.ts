import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionAddComponent } from './suggestion-add.component';

describe('SuggestionAddComponent', () => {
  let component: SuggestionAddComponent;
  let fixture: ComponentFixture<SuggestionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
