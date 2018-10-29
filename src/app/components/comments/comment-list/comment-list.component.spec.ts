import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReverseArrayPipe } from '../../../shared/pipes/reverse-array.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs/internal/observable/of';

import { CommentListComponent } from './comment-list.component';
import { CommentComponent } from '../comment/comment.component';
import { CommentService } from '../../../services/comment.service';
import { Comment } from 'app/shared/class/comment';
import { By } from '@angular/platform-browser';
import { MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class UserInfoOpenStub {
  constructor(
    public alias: string,
    public fName: string,
    public lName: string,
    public uid?: string,
    public imageUrl?: string,
    public email?: string,
    public zipCode?: string,
    public bio?: string,
    public city?: string,
    public state?: string,
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

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  let CommentServiceStub: any;

  beforeEach(async(() => {

    CommentServiceStub = {
      createComment: () => {
        return of('test');
      },
      removeComment: () => {
        return of('test');
      },
      updateComment: () => {
        return of('test');
      },
      watchCommentsByParent: (parentKey) => {
          const testComment = {
            payload: {
              val: () => {
                return {
                  authorId: 'testID',
                  parentKey: parentKey,
                  text: 'test Comment',
                  lastUpdated: 123456,
                  timestamp: 123456
                };
              },
            },
            key: 'testSnapKey' + (Math.random() * 100).toString()
          };
          const comments = of([of(testComment)]);

          // return of('test');
          return of(comments);
      },
      getUserInfo: () => {
        return of('test');
      }

    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      declarations: [
        CommentListComponent,
        CommentComponent,
        ReverseArrayPipe,
      ],
      providers: [
        { provide: CommentService, useValue: CommentServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;

    component.loggedInUser = new UserInfoOpenStub('test', 'tester', 'testson', 'testUID', 'testImgUrl', 'test@mail.com', 'zipcode', 'testBIo', 'testCity', 'testState');
    component.parentKey = 'testParentKey';
    component.isUnderComment = false;
    component.userMap = {
      userKey1: component.loggedInUser,
      userKey2: new UserInfoOpenStub('', 'george', 'costanza', '123', 'georgeURL', 'email.com', 'zipcode', 'bio', 'city', 'state'),
      userKey3: new UserInfoOpenStub('', 'elaine', 'benes', '123', 'elaineURL', 'email.com', 'zipcode', 'bio', 'city', 'state'),
    };
    component.userKeys = ['userKey1', 'userKey2', 'userKey3'];
    component.commentReplyInfo = {replyParentKey: null};
    fixture.detectChanges();
  });

  afterEach(() => {
    component.commentsSubscription.unsubscribe();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  xdescribe('initialization', () => {
    let watchCommentsByParentSpy: jasmine.Spy;

    beforeEach(() => {
      fixture.detectChanges();
    });

    it(`should HAVE a user in userMap after ngOnInit`, async () => {
      expect(Object.keys(component.commentMap).length).toBe(1, 'comment keys list is empty before init');
    });

    // testing this method requires Observables to be sent back from the CommentService
    // to simulate that requrires returning of(comments) (see line 92). This causes an
    // infinite loop somewhere that I can't pinpoint but essentially fillDataMaps is
    // called repeatedly and causes karma to crash. Use the debugger to see this.
    // commenting out comment-list.ts lines 88-93 solves this loop.
    it('should call watchCommentsByParent() in service', () => {
      const commentSvc = TestBed.get(CommentService);
      watchCommentsByParentSpy = spyOn(commentSvc, 'watchCommentsByParent');
      fixture.detectChanges();

      expect(watchCommentsByParentSpy).toHaveBeenCalledWith('0000test0000');
    });

    xit('should have populated commentMap after ngOnInit', () => {

    });

    xit('should have populated userMap after ngOnInit', () => {

    });

  });

  describe('comment controls', () => {
    beforeEach(async(() => {
      fixture.detectChanges();
      component.commentMap = {
        testKey1: new Comment('testUID', 'testParentKey', 'test comment 1', null, null),
        testKey2: new Comment('wrongUID', 'testParentKey', 'test comment 2', null, null),
        testKey3: new Comment('testUID', 'testParentKey', 'test comment 3', null, null),
      };
      component.commentKeys = ['testKey1', 'testKey2', 'testKey3'];
      component.keyOfCommentBeingEdited = null;
      fixture.detectChanges();
    }));

    it('SHOULD NOT display control buttons for comment that user did not submit', async(() => {
      const de = fixture.debugElement.query(By.css('#testKey2'));

      expect(de.nativeElement.children.length).toBe(1);
    }));

    it('SHOULD display control buttons for comment that user did not submit', async(() => {
      const de = fixture.debugElement.query(By.css('#testKey1'));

      expect(de.nativeElement.children.length).toBe(2);
    }));

    describe('edit button', () => {
      it('component should default to not editing a comment', async () => {
        fixture.whenStable().then(() => {
          expect(component.keyOfCommentBeingEdited).toBeFalsy();
        });
      });

      it('should call enterEditMode() with testKey on click', async(() => {
        spyOn(component, 'enterEditMode');

        const de = fixture.debugElement.query(By.css('#testKey1'));

        const button: HTMLElement = de.nativeElement.children[1].children[0];
        button.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.enterEditMode).toHaveBeenCalledWith('testKey1');
        });
      }));

      it('enterEditMode(key) should update keyOfCommentBeingUpdated', () => {
        component.enterEditMode('testKey');

        expect(component.keyOfCommentBeingEdited).toBe('testKey');
      });

      it('commentIsBeingEdited should return true if keyOfCommentBeingEdited matches the current comment key', () => {
        component.keyOfCommentBeingEdited = 'testerKey';
        expect(component.commentIsBeingEdited('test')).toBe(false);
        expect(component.commentIsBeingEdited('testerKey')).toBe(true);
      });

      it('should update buttons appropriately when clicked', () => {
        const de = fixture.debugElement.query(By.css('#testKey1 .comment-controls__sub-unit'));
        const editButton: HTMLElement = de.nativeElement.children[0];

        expect(de.nativeElement.children[0].textContent).toContain('Edit');
        expect(de.nativeElement.children[1].textContent).toContain('Remove');

        editButton.click();
        fixture.detectChanges();

        expect(de.nativeElement.children[0].textContent).toContain('Save');
        expect(de.nativeElement.children[1].textContent).toContain('Cancel');

      });

    });

    describe('remove button', () => {
      it('should call onRemoveComment() with testKey on click', async(() => {
        spyOn(component, 'onRemoveComment');
        const de = fixture.debugElement.query(By.css('#testKey1 .comment-controls__sub-unit'));
        const removeButton: HTMLElement = de.nativeElement.children[1];

        removeButton.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.onRemoveComment).toHaveBeenCalledWith('testKey1');
        });
      }));

      it('onRemoveComment(key) should call removeComment(key) in service', async () => {
        const commentSvc = TestBed.get(CommentService);
        const removeCommentSpy = spyOn(commentSvc, 'removeComment');

        const de = fixture.debugElement.query(By.css('#testKey1 .comment-controls__sub-unit'));
        const removeButton: HTMLElement = de.nativeElement.children[1];

        removeButton.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(removeCommentSpy).toHaveBeenCalledWith('testKey1');
        });
      });

    });



  });
});
