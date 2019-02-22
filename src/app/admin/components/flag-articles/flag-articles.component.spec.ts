import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagArticlesComponent } from './flag-articles.component';

describe('FlagArticlesComponent', () => {
  let component: FlagArticlesComponent;
  let fixture: ComponentFixture<FlagArticlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagArticlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
