import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumMessagePage } from './forum-message.page';

describe('ForumMessagePage', () => {
  let component: ForumMessagePage;
  let fixture: ComponentFixture<ForumMessagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumMessagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumMessagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
