import { Component, OnInit } from '@angular/core';
import { DataCleanupService } from '@admin/services/data-cleanup.service';

@Component({
  selector: 'cos-data-cleanup',
  templateUrl: './data-cleanup.component.html',
  styleUrls: ['./data-cleanup.component.scss']
})
export class DataCleanupComponent implements OnInit {

  constructor(
    private cleanupSvc: DataCleanupService
  ) { }

  ngOnInit() {
  }

  addUsersToRtdb() {

  }

}
