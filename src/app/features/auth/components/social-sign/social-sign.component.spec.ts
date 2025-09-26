/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SocialSignComponent } from './social-sign.component';

describe('SocialSignUpComponent', () => {
  let component: SocialSignComponent;
  let fixture: ComponentFixture<SocialSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialSignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
