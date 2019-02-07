import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMyResourcePage } from './select-my-resource.page';

describe('SelectMyResourcePage', () => {
  let component: SelectMyResourcePage;
  let fixture: ComponentFixture<SelectMyResourcePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMyResourcePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMyResourcePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
