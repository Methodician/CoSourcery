import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    userSvc = new UserService(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
