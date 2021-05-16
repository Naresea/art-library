import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGalleryLibComponent } from './image-gallery-lib.component';

describe('ImageGalleryLibComponent', () => {
  let component: ImageGalleryLibComponent;
  let fixture: ComponentFixture<ImageGalleryLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageGalleryLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGalleryLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
