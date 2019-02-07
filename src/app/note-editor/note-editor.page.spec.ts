import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteEditorPage } from './note-editor.page';

describe('NoteEditorPage', () => {
  let component: NoteEditorPage;
  let fixture: ComponentFixture<NoteEditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteEditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
