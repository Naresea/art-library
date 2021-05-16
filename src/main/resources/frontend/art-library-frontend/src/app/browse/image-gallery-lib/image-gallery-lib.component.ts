import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {ImageMetadata, ImageSize, Page} from "../../models/image.model";
import {
  GridLayout,
  Image,
  ImageModalEvent,
  PlainGalleryConfig,
  PlainGalleryStrategy
} from "@ks89/angular-modal-gallery";
import {ImageService} from "../../services/image.service";
import {ReplaySubject, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-image-gallery-lib',
  templateUrl: './image-gallery-lib.component.html',
  styleUrls: ['./image-gallery-lib.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageGalleryLibComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly imagePage$$ = new ReplaySubject<Page<ImageMetadata> | undefined | null>(1);

  @Input()
  public set imagePage(imagePage: Page<ImageMetadata> | undefined | null) {
    this.imagePage$$.next(imagePage);
  }

  @Output()
  public imageSelected = new EventEmitter<ImageMetadata | undefined>();

  @Output()
  public nextPage = new EventEmitter<void>();

  public readonly plainConfig$$ = new ReplaySubject<PlainGalleryConfig>(1);
  public modalImages: Array<Image> = [];
  public originalImages: Array<ImageMetadata> = [];

  private readonly destroy$$ = new Subject<void>();

  constructor(private readonly elementRef: ElementRef, private readonly cdr: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this.imagePage$$.pipe(
      takeUntil(this.destroy$$)
    ).subscribe((page) => {
      if (!page) {
        this.modalImages = [];
        this.originalImages = [];
      } else {
        this.modalImages = [...this.modalImages, ...this.getModalImages(page)];
        this.originalImages = [...this.originalImages, ...page.content];
      }
      this.cdr.markForCheck();
    })
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public ngAfterViewInit(): void {
    if (!this.elementRef || !this.elementRef.nativeElement) {
      return;
    }
    const viewBounds = this.elementRef.nativeElement.getBoundingClientRect();

    const newConfig = {
      strategy: PlainGalleryStrategy.GRID,
      layout: new GridLayout({
        width: '256px',
        height: '256px'
      }, {
        length: Math.floor(viewBounds.width / 256),
        wrap: true
      })
    };
    requestAnimationFrame(() => {
      this.plainConfig$$.next(newConfig);
    });
  }

  public handleShow(event: ImageModalEvent): void {
    if (typeof event.result !== 'number') {
      return;
    }
    const image = this.originalImages[event.result];
    this.imageSelected.emit(image);
  }

  public close(): void {
    this.imageSelected.emit(undefined);
  }

  private getModalImages(page: Page<ImageMetadata> | undefined | null): Array<Image> {
    if (!page) {
      return [];
    }
    return page.content.map(img => new Image(
      img.id + 5000,
      {
        img: ImageService.getImageUrl(img, ImageSize.ORIGINAL),
        description: img.description,
        title: img.title,
        alt: 'An image.'
      }, {
        img: ImageService.getImageUrl(img, ImageSize.MEDIUM),
        description: img.description,
        title: img.title,
        alt: 'An image.'
      }
    ));
  }

  public scrolled(): void {
    this.nextPage.emit();
  }
}
