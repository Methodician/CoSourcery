import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CommentComponent } from './comment.component';

import { UserInfoOpen } from '../../../shared/class/user-info';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class UserInfoOpenStub {
  constructor(
      public alias: string,
      public fName: string,
      public lName: string,
      public uid?: string,
      public imageUrl?: string,
  ) { }

  displayName() {
      return this.alias ? this.alias : this.fName;
  }

  displayImageUrl() {
      if (!this.imageUrl || this.imageUrl === '') {
          return 'assets/images/logo.png';
      }
      return this.imageUrl;
  }

  // returns true if uid contains a truthy value (is neither null nor an empty string)
  exists() {
      return !!(this.uid);
  }
}

class CommentStub {
  constructor(
      public text?: string,
      public lastUpdated?: number,
  ) {
      this.text = text || '';
      this.lastUpdated = lastUpdated || new Date().getTime();
  }
}

describe('CommentComponent - ', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      declarations: [ CommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;

    component.authorInfo = new UserInfoOpenStub(null, null, null);
    component.comment = new CommentStub;
    component.loggedInUser = null;
    component.isBeingEdited = false;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('authorInfo - ', () => {

    it('should render the author\'s alias if one is recieved', () => {
      component.authorInfo = new UserInfoOpen('J-Boi', 'Jeff', 'Goldblum');

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__author'));

      const el: HTMLElement = de.nativeElement.children[0];

      expect(el.innerText).toContain('J-Boi');
    });

    it('should render the author\'s first name if no alias is recieved', () => {
      component.authorInfo = new UserInfoOpenStub(null, 'Jeff', 'Goldblum');

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__author'));
      const el: HTMLElement = de.nativeElement.children[0];

      expect(el.innerText).toContain('Jeff');
    });

    it('should render nothing for author name if no authorInfo is recieved', () => {

      const de = fixture.debugElement.query(By.css('.comment__author'));
      const el: HTMLElement = de.nativeElement.children[0];

      expect(el.innerText).toBe('Posted by');
    });

    it('should render default img if no authorInfo img is set', () => {

      const de = fixture.debugElement.query(By.css('.comment__author-image'));
      const el: HTMLImageElement = de.nativeElement;


      expect(el.src).toContain('assets/images/logo.png');
    });

    it('should render custom img if  set in authorInfo', () => {
      component.authorInfo.imageUrl = 'https://i.imgur.com/lFfVeiu.png?1';

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__author-image'));
      const el: HTMLImageElement = de.nativeElement;


      expect(el.src).toBe('https://i.imgur.com/lFfVeiu.png?1');
    });

  });

  describe('comment - ', () => {

    it('should display comment text if !isBeingUpdated', () => {
      component.comment.text = 'I\'m a comment, hurr durr';

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__text'));
      const el: HTMLElement = de.nativeElement;

      expect(el.innerText).toContain('I\'m a comment, hurr durr');
    });

    it('comment-body should be an input element if being edited', () => {
      component.isBeingEdited = true;

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__text'));
      const el: HTMLElement = de.nativeElement;

      expect(el.children[0].tagName).toBe('TEXTAREA');
    });

    it('comment-body should should start with value of original comment text when being edited', () => {
      component.comment.text = 'I\'m a comment, hurr durr';
      component.isBeingEdited = true;

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__text'));
      const el: HTMLInputElement = de.nativeElement.children[0].attributes[6].nodeValue;

      expect(el).toContain('I\'m a comment, hurr durr');
    });

    it('should display last updated date appropriately if none given', () => {
      const de = fixture.debugElement.query(By.css('.comment__author-detail_light'));
      const el: HTMLElement = de.nativeElement;

      const options = { year: 'numeric', month: 'short', day: 'numeric' };

      expect(el.innerText).toContain(new Date().toLocaleDateString('en-US', options));
    });

    it('should display last updated text appropriately if given', () => {
      component.comment.lastUpdated = new Date(1990, 1, 10).getTime();

      fixture.detectChanges();

      const de = fixture.debugElement.query(By.css('.comment__author-detail_light'));
      const el: HTMLElement = de.nativeElement;

      const options = { year: 'numeric', month: 'short', day: 'numeric' };

      expect(el.innerText).toContain(new Date(1990, 1, 10).toLocaleDateString('en-US', options));
    });
  });

});
