import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
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
import {BehaviorSubject, combineLatest, ReplaySubject, Subject} from "rxjs";
import {distinctUntilChanged, startWith, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-image-gallery-lib',
  templateUrl: './image-gallery-lib.component.html',
  styleUrls: ['./image-gallery-lib.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageGalleryLibComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly maxPages = 3;
  private readonly imagePages$$ = new ReplaySubject<Array<Page<ImageMetadata>> | undefined | null>(1);
  private readonly requestedPage$$ = new ReplaySubject<number>(1);
  private readonly scrollTop$$ = new ReplaySubject<number>(1);

  private readonly pagesReady$$ = new BehaviorSubject<boolean>(false);
  public readonly pagesReady$ = this.pagesReady$$.pipe(
    distinctUntilChanged()
  );

  private pages: Array<Page<ImageMetadata>> = [];

  @ViewChild('scrollWindow', {read: ElementRef})
  private scrollWindow?: ElementRef;

  @Input()
  public pageSize?: number = 100;

  @Input()
  public set imagePage(imagePage: Page<ImageMetadata> | undefined | null) {
    if (!imagePage) {
      this.pages = [];
      this.imagePages$$.next(this.pages);
      return;
    }

    const maxPage = this.pages[this.pages.length - 1];
    const minPage = this.pages[0];
    let up = false;

    if (minPage && minPage.number > imagePage.number) {
      // insert front, kick back
      this.pages = [imagePage, ...this.pages];
      if (this.pages.length > this.maxPages) {
        this.pages = this.pages.slice(0, this.maxPages);
      }
      up = true;
    } else if (maxPage && maxPage.number < imagePage.number) {
      // insert back, kick front
      this.pages = [...this.pages, imagePage];
      if (this.pages.length > this.maxPages) {
        this.pages = this.pages.slice(this.pages.length - this.maxPages);
      }
    } else {
      // just replace
      this.pages = [imagePage];
    }

    this.imagePages$$.next(this.pages);
    this.resetScrollTop(up);
    if (this.pages.length < this.maxPages && !this.pages[this.pages.length - 1]?.last) {
      const page = this.pages[this.pages.length - 1];
      this.requestedPage$$.next(page.number + 1);
    } else {
      this.pagesReady$$.next(true);
    }
  }

  @Output()
  public imageSelected = new EventEmitter<ImageMetadata | undefined>();

  @Output()
  public requestPage = new EventEmitter<number>();

  public readonly plainConfig$$ = new ReplaySubject<PlainGalleryConfig>(1);
  public modalImages: Array<Image> = [];
  public originalImages: Array<ImageMetadata> = [];

  private readonly destroy$$ = new Subject<void>();

  constructor(private readonly elementRef: ElementRef, private readonly cdr: ChangeDetectorRef) { }

  public ngOnInit(): void {
    combineLatest([
      this.imagePages$$,
      this.scrollTop$$.pipe(distinctUntilChanged(), startWith(0))
    ]).pipe(
      takeUntil(this.destroy$$)
    ).subscribe(([pages, scrollTop]) => {
      this.updateImageGallery(pages);
      requestAnimationFrame(() => {
        if (this.scrollWindow?.nativeElement) {
          this.scrollWindow.nativeElement.scrollTop = scrollTop;
        }
      });
      this.cdr.markForCheck();
    });

    this.requestedPage$$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$$)
    ).subscribe((n) => this.requestPage.emit(n));
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

    const maxNumColumns = Math.floor(viewBounds.width / 256);
    let numColumns = 1;
    const pageSize = this.pageSize ?? 50;

    for (let i = maxNumColumns; i > 1; i--) {
      if (pageSize % i === 0) {
        numColumns = i;
        break;
      }
    }

    const newConfig = {
      strategy: PlainGalleryStrategy.GRID,
      layout: new GridLayout({
        width: '256px',
        height: '256px'
      }, {
        length: numColumns,
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
    const image = this.originalImages[event.result - 1];
    this.imageSelected.emit(image);
  }

  public close(): void {
    this.imageSelected.emit(undefined);
  }

  private updateImageGallery(pages: Array<Page<ImageMetadata>> | undefined | null): void {
    this.modalImages = [];
    this.originalImages = [];
    if (!pages) {
      return;
    }
    const content = pages.map(p => p.content).reduce((accu, curr) => {
      accu.push(...curr);
      return accu;
    }, []);
    for (let i = 0; i < content.length; i++) {
      const img = content[i];
      const modal = new Image(
        img.id,
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
      );
      this.modalImages.push(modal);
      this.originalImages.push(img);
    }
  }

  public nextPage(): void {
    const currentMaxPage = this.pages[this.pages.length - 1];
    if (!currentMaxPage || currentMaxPage.last) {
      return;
    }
    this.requestedPage$$.next(currentMaxPage.number + 1);
  }

  public prevPage(): void {
    const currentMinPage = this.pages[0];
    if (!currentMinPage || currentMinPage.first) {
      return;
    }
    this.requestedPage$$.next(currentMinPage.number - 1);
  }

  private resetScrollTop(up: boolean): void {
    if (!this.scrollWindow?.nativeElement || this.pages.length < this.maxPages) {
      return;
    }
    const win = this.scrollWindow.nativeElement;
    const scrollHeight = win.scrollHeight;
    const currentScrollTop = win.scrollTop;
    const newScrollTop = up
      ? currentScrollTop + (1 / this.pages.length) * scrollHeight
      : currentScrollTop - (1 / this.pages.length) * scrollHeight;
    this.scrollTop$$.next(newScrollTop);
  }
}
