import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentAddPage } from './comment-add.page';

describe('CommentAddPage', () => {
  let component: CommentAddPage;
  let fixture: ComponentFixture<CommentAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentAddPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
