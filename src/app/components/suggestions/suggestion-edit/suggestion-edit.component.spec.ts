import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionEditComponent } from './suggestion-edit.component';

describe('SuggestionEditComponent', () => {
  let component: SuggestionEditComponent;
  let fixture: ComponentFixture<SuggestionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
