import { TestBed, inject } from '@angular/core/testing';

import { UnsavedChangesGuard } from './unsaved-changes.guard';

xdescribe('UnsavedChangesGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnsavedChangesGuard],
    });
  });

  it('should ...', inject(
    [UnsavedChangesGuard],
    (guard: UnsavedChangesGuard) => {
      expect(guard).toBeTruthy();
    },
  ));
});
