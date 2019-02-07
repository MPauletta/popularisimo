import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectGroupMembersPage } from './select-group-members.page';

describe('SelectGroupMembersPage', () => {
  let component: SelectGroupMembersPage;
  let fixture: ComponentFixture<SelectGroupMembersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectGroupMembersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectGroupMembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
