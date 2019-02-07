import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCalendarPage } from './group-calendar.page';

describe('GroupCalendarPage', () => {
  let component: GroupCalendarPage;
  let fixture: ComponentFixture<GroupCalendarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCalendarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
