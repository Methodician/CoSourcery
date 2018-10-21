import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCleanupComponent } from './data-cleanup.component';

xdescribe('DataCleanupComponent', () => {
  let component: DataCleanupComponent;
  let fixture: ComponentFixture<DataCleanupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCleanupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCleanupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // userSvc = new UserService(null);  // why is this here - MK 10/21/2018?
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
