import { async, ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<< HEAD:src/app/components/articles/article-detail/article-detail.component.spec.ts
import { ArticleDetailComponent } from './article-detail.component';
import { UserService } from '../../../services/user.service';

xdescribe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let userSvc: UserService;
  let fixture: ComponentFixture<ArticleDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleDetailComponent ]
    }).compileComponents();
=======
import { DataCleanupComponent } from './data-cleanup.component';

describe('DataCleanupComponent', () => {
  let component: DataCleanupComponent;
  let fixture: ComponentFixture<DataCleanupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCleanupComponent ]
    })
    .compileComponents();
>>>>>>> bebca416f22a085d49c6a98501972aaa92d937d3:src/app/admin/components/data-cleanup/data-cleanup.component.spec.ts
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCleanupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    userSvc = new UserService(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
