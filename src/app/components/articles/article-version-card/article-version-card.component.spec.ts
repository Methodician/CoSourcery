import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleVersionCardComponent } from './article-version-card.component';

describe('ArticleVersionCardComponent', () => {
  let component: ArticleVersionCardComponent;
  let fixture: ComponentFixture<ArticleVersionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleVersionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleVersionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
