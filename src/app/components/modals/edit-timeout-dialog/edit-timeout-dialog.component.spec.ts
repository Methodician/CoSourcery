import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTimeoutDialogComponent } from './edit-timeout-dialog.component';

describe('EditTimeoutDialogComponent', () => {
  let component: EditTimeoutDialogComponent;
  let fixture: ComponentFixture<EditTimeoutDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTimeoutDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTimeoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
