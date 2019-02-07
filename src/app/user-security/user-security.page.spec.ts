import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSecurityPage } from './user-security.page';

describe('UserSecurityPage', () => {
  let component: UserSecurityPage;
  let fixture: ComponentFixture<UserSecurityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSecurityPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSecurityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
