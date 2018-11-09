import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTimeoutComponent } from './edit-timeout.component';

describe('EditTimeoutComponent', () => {
  let component: EditTimeoutComponent;
  let fixture: ComponentFixture<EditTimeoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTimeoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTimeoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
