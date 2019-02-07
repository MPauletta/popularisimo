import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFriendsPage } from './select-friends.page';

describe('SelectFriendsPage', () => {
  let component: SelectFriendsPage;
  let fixture: ComponentFixture<SelectFriendsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFriendsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFriendsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
