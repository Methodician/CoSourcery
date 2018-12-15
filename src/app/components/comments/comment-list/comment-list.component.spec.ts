import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReverseArrayPipe } from '../../../shared/pipes/reverse-array.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs/internal/observable/of';

import { } from 'jasmine';
import { CommentListComponent } from './comment-list.component';
import { CommentComponent } from '../comment/comment.component';
import { Comment, ParentTypes } from '@class/comment';
import { CommentService } from '@services/comment.service';
import { By } from '@angular/platform-browser';
import { MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialog, MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserInfoOpen } from '@class/user-info';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';


describe('CommentListComponent - ', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  let CommentServiceStub: any;

  beforeEach(async(() => {

    CommentServiceStub = {
      createCommentStub: () => {
        return of('test');
      },
      removeComment: () => {
        return of('test');
      },
      updateComment: () => {
        return of('test');
      },
      watchCommentsByParent: (parentKey) => {
        const testComment1 = {
          payload: {
            val: () => {
              return new Comment('userKey3', parentKey, 'test Comment 1', 123456, 123456, 0, ParentTypes.comment, 0);
            },
          },
          key: 'testCommentKey1'
        };
        const testComment2 = {
          payload: {
            val: () => {
              return new Comment('userKey1', 'otherTestKey', 'test Comment 2', 123456, 123456, 0, ParentTypes.comment, 0);
            },
          },
          key: 'testCommentKey2'
        };
        const testComment3 = {
          payload: {
            val: () => {
              return new Comment('userKey2', 'otherTestKey', 'test Comment 3', 123456, 123456, 0, ParentTypes.comment, 0);
            },
          },
          key: 'testCommentKey3'
        };
        const testComment4 = {
          payload: {
            val: () => {
              return new Comment('userKey2', 'otherTestKey', 'test Comment 4', 123456, 123456, 0, ParentTypes.comment, 0);
            },
          },
          key: 'testCommentKey4'
        };
        const testComment5 = {
          payload: {
            val: () => {
              return new Comment('loggedInUserKey', 'otherTestKey', 'test Comment 5', 123456, 123456, 0, ParentTypes.comment, 0);
            },
          },
          key: 'testCommentKey5'
        };

        const comments = of([of(testComment1), of(testComment2), of(testComment3), of(testComment4), of(testComment5)]);

        return comments;
      },
      getUserInfo: (userId) => {
        if (userId === 'userKey1') {
          return {
            val: () => {
              return new UserInfoOpen('J-Boi', 'Jeff', 'Goldblume', 'GoldKey', 'http://8.media.bustedtees.cvcdn.com/1/-/bustedtees.7252ae81-33f1-47fc-af07-52f9127c.gif');
            },
            key: 'userKey1'
          };
        } else if (userId === 'userKey2') {
          return {
            val: () => {
              return new UserInfoOpen('', 'elaine', 'benes', 'userKey2', 'elaineURL', 'email.com', 'zipcode', 'bio', 'city', 'state');
            },
            key: 'userKey2'
          };
        } else if (userId === 'userKey3') {
          return {
            val: () => {
              return new UserInfoOpen('', 'george', 'costanza', 'userKey3', 'georgeURL', 'email.com', 'zipcode', 'bio', 'city', 'state');
            },
            key: 'userKey3'
          };
        }
      },
      upvoteComment(uid, commentKey, direction) {

      },
      downvoteComment(uid, commentKey, direction) {

      }

    };

    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule
      ],
      declarations: [
        CommentListComponent,
        CommentComponent,
        ReverseArrayPipe,
      ],
      providers: [
        { provide: CommentService, useValue: CommentServiceStub },
        MatDialog,
        Overlay
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;

    component.isUnderComment = false;
    component.parentKey = 'testParentKey';
    component.loggedInUser = new UserInfoOpen('loggedInUser', 'tester', 'testson', 'loggedInUserKey', 'testImgUrl', 'test@mail.com', 'zipcode', 'testBIo', 'testCity', 'testState');
    component.userMap = {
      loggedInUserKey: component.loggedInUser,
    };
    component.userVotesMap = {};
    component.userKeys = ['loggedInUserKey'];
    component.commentReplyInfo = { replyParentKey: null };
    component.commentEditInfo = { commentKey: null };


    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization - ', () => {
    let spy: jasmine.Spy;

    it('should call fillDataMaps()', () => {
      spy = spyOn(component, 'fillDataMaps');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should call unfurlCommentObservable()', () => {
      spy = spyOn(component, 'unfurlCommentObservables');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should call mapCommentSnapshot()', () => {
      spy = spyOn(component, 'mapCommentSnapshot');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should call mapUser()', () => {
      spy = spyOn(component, 'mapUser');
      component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it(`should HAVE users in userMap of 4 after init`, async () => {
      fixture.whenStable().then(() => {
        expect(Object.keys(component.userMap).length).toBe(4);
      });
    });

    it(`should HAVE comments in commentMap of 5 after init`, async () => {
      fixture.whenStable().then(() => {
        expect(Object.keys(component.commentMap).length).toBe(5);
      });
    });

  });

  describe('comment controls - ', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('commentIsBeingEdited should return true if commentEditInfo.commentKey matches the current comment key', () => {
      component.commentEditInfo.commentKey = 'testerKey';
      expect(component.commentIsBeingEdited('test')).toBe(false);
      expect(component.commentIsBeingEdited('testerKey')).toBe(true);
    });

    it('SHOULD NOT display control buttons for comment that user DID NOT submit', () => {
      const de = fixture.debugElement.query(By.css('#testCommentKey2 .comment-controls'));

      fixture.whenStable().then(() => {
        expect(de.nativeElement.children.length).toBe(1);
      });
    });

    it('SHOULD display control buttons for comment that user DID submit', () => {
      const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls'));

      fixture.whenStable().then(() => {
        expect(de.nativeElement.children.length).toBe(2);
      });
    });

    it('should update buttons appropriately when edit is clicked', () => {

      const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls__btn-group'));
      const editButton: HTMLElement = de.nativeElement.children[0];

      expect(de.nativeElement.children[0].textContent).toContain('Edit');
      expect(de.nativeElement.children[1].textContent).toContain('Remove');

      editButton.click();
      fixture.detectChanges();

      expect(de.nativeElement.children[0].textContent).toContain('Save');
      expect(de.nativeElement.children[1].textContent).toContain('Cancel');

    });

    describe('reply button', () => {
      it('should call enterNewCommentMode() with testKey on click', async(() => {
        spyOn(component, 'enterNewCommentMode');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-controls'));

        fixture.whenStable().then(() => {
          const replyButton: HTMLElement = de.nativeElement.children[0];

          replyButton.click();
          fixture.detectChanges();

          expect(component.enterNewCommentMode).toHaveBeenCalledWith('testCommentKey1');
        });
      }));

      it('enterNewCommentMode(key) should call removeComment(key) in service', async () => {
        const commentSvc = TestBed.get(CommentService);
        const createCommentStubSpy = spyOn(commentSvc, 'createCommentStub');

        component.enterNewCommentMode(component.parentKey);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(createCommentStubSpy).toHaveBeenCalledWith(component.loggedInUser.uid, 'testParentKey', 'comment');
        });
      });

    });

    describe('edit button', () => {
      it('component should default to not editing a comment', async () => {
        fixture.whenStable().then(() => {
          expect(component.commentEditInfo.commentKey).toBeFalsy();
        });
      });

      it('should call enterEditMode(key) with testKey on click', async(() => {
        spyOn(component, 'enterEditMode');

        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls'));

        const button: HTMLElement = de.nativeElement.children[1].children[0];
        button.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.enterEditMode).toHaveBeenCalledWith('testCommentKey5');
        });
      }));

      it('enterEditMode(key) should update keyOfCommentBeingUpdated', () => {
        component.enterEditMode('testKey');

        expect(component.commentEditInfo.commentKey).toBe('testKey');
      });

    });

    describe('remove button', () => {
      it('should call onRemoveComment(key) with testKey on click', async(() => {
        spyOn(component, 'onRemoveComment');
        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls__btn-group'));
        const removeButton: HTMLElement = de.nativeElement.children[1];

        removeButton.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.onRemoveComment).toHaveBeenCalledWith('testCommentKey5');
        });
      }));

      it('onRemoveComment(key) should call removeComment(key) in service', async () => {
        const commentSvc = TestBed.get(CommentService);
        const removeCommentSpy = spyOn(commentSvc, 'removeComment');

        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls__btn-group'));
        const removeButton: HTMLElement = de.nativeElement.children[1];

        removeButton.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(removeCommentSpy).toHaveBeenCalledWith('testCommentKey5');
        });
      });

    });

    describe('save button', () => {
      it('should call onSaveEdits() on click', async(() => {
        spyOn(component, 'onSaveEdits');
        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls__btn-group'));
        const editButton: HTMLElement = de.nativeElement.children[0];

        editButton.click();
        fixture.detectChanges();

        const saveButton: HTMLElement = de.nativeElement.children[0];

        saveButton.click();
        fixture.detectChanges();


        fixture.whenStable().then(() => {
          expect(component.onSaveEdits).toHaveBeenCalled();
        });
      }));

      it('onSaveEdits() should call updateComment(Comment, key) in service', () => {
        const commentSvc = TestBed.get(CommentService);
        const updateCommentSpy = spyOn(commentSvc, 'updateComment');
        component.commentEditInfo.commentKey = 'testKey1';

        component.onSaveEdits();

        fixture.detectChanges();

        expect(updateCommentSpy).toHaveBeenCalledWith(component.commentMap['testKey1'], 'testKey1');
      });

      it('onSaveEdits() should update keyOfCommentBeingUpdated to null', () => {
        component.commentEditInfo.commentKey = 'testKey';

        component.onSaveEdits();
        fixture.detectChanges();

        expect(component.commentEditInfo.commentKey).toBe(null);
      });

    });

    describe('cancel button', () => {
      it('should call onCancelEdit() with testKey on click', async(() => {
        spyOn(component, 'onCancelEdit');
        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-controls__btn-group'));
        const editButton: HTMLElement = de.nativeElement.children[0];

        editButton.click();
        fixture.detectChanges();

        const cancelButton: HTMLElement = de.nativeElement.children[1];

        cancelButton.click();
        fixture.detectChanges();


        fixture.whenStable().then(() => {
          expect(component.onCancelEdit).toHaveBeenCalled();
        });
      }));

      it('onCancelEdit() should update keyOfCommentBeingUpdated to null', () => {
        component.commentEditInfo.commentKey = 'testKey';
        expect(component.commentEditInfo.commentKey).toBe('testKey');

        component.onCancelEdit();
        fixture.detectChanges();

        expect(component.commentEditInfo.commentKey).toBe(null);
      });

    });

  });

  describe('voting - ', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('comments should display a vote score', () => {
      const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating .comment-rating__score-container .comment-rating__score'));

      expect(de.nativeElement.innerText).toBe('0');
    });

    describe('Upvote Button - ', () => {
      beforeEach(() => {
        component.userVotesMap = { testCommentKey5: 1 };
        fixture.detectChanges();
      });

      it('comments should have an "upvote" button', () => {
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[1];

        expect(upButton.children[1].textContent).toBe('Upvote');
      });

      it('comments should have an "remove vote" button if already voted up', () => {
        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-rating'));
        const upButton = de.nativeElement.children[1];

        expect(upButton.children[1].textContent).toBe('Remove Vote');
      });

      it('should call commentAuthCheck() on click', () => {
        spyOn(component, 'authCheck');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[1];

        upButton.click();
        fixture.detectChanges();

        expect(component.authCheck).toHaveBeenCalled();
      });

      it('should call onUpvoteComment() on click', () => {
        spyOn(component, 'onUpvoteComment');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[1];

        upButton.click();
        fixture.detectChanges();

        expect(component.onUpvoteComment).toHaveBeenCalled();
      });

      it('should call upvoteComment() in service on click', () => {
        const commentSvc = TestBed.get(CommentService);
        const spy = spyOn(commentSvc, 'upvoteComment');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[1];

        upButton.click();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalled();
      });

    });

    describe('Downvote Button - ', () => {
      beforeEach(() => {
        component.userVotesMap = { testCommentKey5: -1 };
        fixture.detectChanges();
      });

      it('comments should have an "downvote" button', () => {
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const downButton = de.nativeElement.children[2];

        expect(downButton.children[1].textContent).toBe('Downvote');
      });

      it('comments should have an "remove vote" button if already voted down', () => {
        const de = fixture.debugElement.query(By.css('#testCommentKey5 .comment-rating'));
        const downButton = de.nativeElement.children[2];

        expect(downButton.children[1].textContent).toBe('Remove Vote');
      });

      it('should call authCheck() on click', () => {
        spyOn(component, 'authCheck');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[2];

        upButton.click();
        fixture.detectChanges();

        expect(component.authCheck).toHaveBeenCalled();
      });

      it('should call onDownvoteComment() on click', () => {
        spyOn(component, 'onDownvoteComment');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[2];

        upButton.click();
        fixture.detectChanges();

        expect(component.onDownvoteComment).toHaveBeenCalled();
      });

      it('should call downvoteComment() in service on click', () => {
        const commentSvc = TestBed.get(CommentService);
        const spy = spyOn(commentSvc, 'downvoteComment');
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[2];

        upButton.click();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalled();
      });

    });

    describe('when not logged in', () => {
      let dialog: MatDialog;

      beforeEach(() => {
        component.parentKey = 'testParentKey';
        component.loggedInUser = new UserInfoOpen('', '', '');
        component.userMap = {};
        component.userKeys = [];
        fixture.detectChanges();
        dialog = TestBed.get(MatDialog);
      });

      it('should NOT call onUpvoteComment() on click when not logged in', () => {
        const upvoteSpy = spyOn(component, 'onUpvoteComment');
        spyOn(dialog, 'open').and.returnValue(false);
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const upButton: HTMLElement = de.nativeElement.children[1];

        upButton.click();
        fixture.detectChanges();

        expect(dialog.open).toHaveBeenCalled();
        expect(upvoteSpy).not.toHaveBeenCalled();
      });

      it('should NOT call onDownvoteComment() on click when not logged in', () => {
        const downvoteSpy = spyOn(component, 'onDownvoteComment');
        spyOn(dialog, 'open').and.returnValue(false);
        const de = fixture.debugElement.query(By.css('#testCommentKey1 .comment-rating'));
        const downButton: HTMLElement = de.nativeElement.children[2];

        downButton.click();
        fixture.detectChanges();

        expect(dialog.open).toHaveBeenCalled();
        expect(downvoteSpy).not.toHaveBeenCalled();
      });
    });

  });
});
