import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStoragePage } from './app-storage.page';

describe('AppStoragePage', () => {
  let component: AppStoragePage;
  let fixture: ComponentFixture<AppStoragePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppStoragePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStoragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
