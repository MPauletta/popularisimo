import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomToastPage } from './custom-toast.page';

describe('CustomToastPage', () => {
  let component: CustomToastPage;
  let fixture: ComponentFixture<CustomToastPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomToastPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomToastPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
