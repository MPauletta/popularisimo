import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumMessageEditorPage } from './forum-message-editor.page';

describe('ForumMessageEditorPage', () => {
  let component: ForumMessageEditorPage;
  let fixture: ComponentFixture<ForumMessageEditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumMessageEditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumMessageEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
