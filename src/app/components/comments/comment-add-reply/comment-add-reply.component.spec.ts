import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentAddReplyComponent } from './comment-add-reply.component';

describe('CommentAddReplyComponent', () => {
  let component: CommentAddReplyComponent;
  let fixture: ComponentFixture<CommentAddReplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentAddReplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentAddReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
