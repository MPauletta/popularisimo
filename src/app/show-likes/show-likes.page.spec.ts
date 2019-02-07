import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLikesPage } from './show-likes.page';

describe('ShowLikesPage', () => {
  let component: ShowLikesPage;
  let fixture: ComponentFixture<ShowLikesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowLikesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowLikesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
