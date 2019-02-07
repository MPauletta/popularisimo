import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEditPage } from './group-edit.page';

describe('GroupEditPage', () => {
  let component: GroupEditPage;
  let fixture: ComponentFixture<GroupEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
