import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPhotoPage } from './show-photo.page';

describe('ShowPhotoPage', () => {
  let component: ShowPhotoPage;
  let fixture: ComponentFixture<ShowPhotoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowPhotoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
