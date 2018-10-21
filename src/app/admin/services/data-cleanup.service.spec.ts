import { TestBed } from '@angular/core/testing';

import { DataCleanupService } from './data-cleanup.service';

xdescribe('DataCleanupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataCleanupService = TestBed.get(DataCleanupService);
    expect(service).toBeTruthy();
  });
});
