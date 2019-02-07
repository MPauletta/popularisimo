import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupResourcesPage } from './group-resources.page';

describe('GroupResourcesPage', () => {
  let component: GroupResourcesPage;
  let fixture: ComponentFixture<GroupResourcesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupResourcesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupResourcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
