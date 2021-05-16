import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSidebarComponent } from './upload-sidebar.component';

describe('UploadSidebarComponent', () => {
  let component: UploadSidebarComponent;
  let fixture: ComponentFixture<UploadSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
