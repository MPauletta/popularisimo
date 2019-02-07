import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageEditorPage } from './message-editor.page';

describe('MessageEditorPage', () => {
  let component: MessageEditorPage;
  let fixture: ComponentFixture<MessageEditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageEditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
