import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberProfilePage } from './member-profile.page';

describe('MemberProfilePage', () => {
  let component: MemberProfilePage;
  let fixture: ComponentFixture<MemberProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
