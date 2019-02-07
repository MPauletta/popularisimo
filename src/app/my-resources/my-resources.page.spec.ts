import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyResourcesPage } from './my-resources.page';

describe('MyResourcesPage', () => {
  let component: MyResourcesPage;
  let fixture: ComponentFixture<MyResourcesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyResourcesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyResourcesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
