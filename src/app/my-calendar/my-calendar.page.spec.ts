import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalendarPage } from './my-calendar.page';

describe('MyCalendarPage', () => {
  let component: MyCalendarPage;
  let fixture: ComponentFixture<MyCalendarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCalendarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
