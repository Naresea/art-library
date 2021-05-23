import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {ImageGalleryData, ImageMetadata, ImageSize, Page} from "../../models/image.model";
import {debounceTime, filter, map, pairwise, takeUntil, throttleTime} from "rxjs/operators";
import {ImageService} from "../../services/image.service";

interface Bounds {
  w: number;
  h: number;
}

@Component({
  selector: 'app-infinite-image-gallery',
  templateUrl: './infinite-image-gallery.component.html',
  styleUrls: ['./infinite-image-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfiniteImageGalleryComponent implements OnInit, AfterViewInit, OnDestroy {

  private isLast = false;

  @ViewChild('scroller')
  private scroller?: CdkVirtualScrollViewport;

  private readonly destroy$$ = new Subject<void>();
  private readonly loading$$ = new BehaviorSubject<boolean>(true);
  private readonly itemSize$$ = new BehaviorSubject<number>(340);
  private readonly images$$ = new BehaviorSubject<Array<ImageMetadata>>([]);
  private readonly bounds$$ = new BehaviorSubject<Bounds>({w: 0, h: 0});
  private readonly numColumns$ = this.getNumColumns$();

  public readonly imageRows$ = this.getImageRows$();
  public readonly itemSize$ = this.itemSize$$.asObservable();
  public readonly isLoading$ = this.getIsLoading$();

  @Input()
  public set itemSize(size: number | undefined | null) {
    if (!size || size < 128 || size > 512) {
      return;
    }
    this.itemSize$$.next(size);
  }
  public get itemSize() {
    return this.itemSize$$.getValue();
  }

  @Output()
  public imageSelected = new EventEmitter<ImageGalleryData>();

  constructor(
    private readonly imageService: ImageService,
    private readonly content: ElementRef,
    private readonly zone: NgZone
  ) {}

  public ngOnInit(): void {
    this.imageService.imagePage$.pipe(
      takeUntil(this.destroy$$)
    ).subscribe((page) => {
      this.updateImagePage(page);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public ngAfterViewInit(): void {
    this.updateBounds();
    if (!this.scroller) {
      console.log('No scroller ref.');
      return;
    }
    const scroller = this.scroller;
    scroller.elementScrolled().pipe(
      map(() => scroller.measureScrollOffset('bottom')),
      pairwise(),
      filter(([y1, y2]) => (y2 < y1 && y2 < 140)),
      throttleTime(200),
      takeUntil(this.destroy$$)
    ).subscribe(() => {
      this.fetchNextPage();
    });
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.updateBounds();
  }

  private updateImagePage(page: Page<ImageMetadata> | undefined | null) {
    if (!page) {
      this.images$$.next([]);
      return;
    }
    this.isLast = page.last;
    const currentImages = this.images$$.getValue();
    const newImages = [...currentImages, ...page.content];
    this.zone.run(() => {
      this.images$$.next(newImages);
      this.loading$$.next(false);
    });
  }

  private fetchNextPage(): void {
    if (this.isLast) {
      return;
    }
    this.loading$$.next(true);
    this.imageService.nextPage();
  }

  private updateBounds() {
    if (!this.content || !this.content.nativeElement) {
      return;
    }
    const clientRect = this.content.nativeElement.getBoundingClientRect();
    const bounds = {w: clientRect.width, h: clientRect.height};
    const current = this.bounds$$.getValue();
    if (current.w === bounds.w && current.h === bounds.h) {
      return;
    }
    requestAnimationFrame(() => {
      this.bounds$$.next(bounds);
    });
  }

  private getImageRows$(): Observable<Array<Array<ImageGalleryData>>> {
    return combineLatest([
      this.numColumns$,
      this.images$$
    ]).pipe(
      map(([cols, images]) => {
        return images.reduce((accu, data) => {
          const currentRow = accu[accu.length - 1];
          const img = this.decorateWithUrls(data);
          if (currentRow.length < cols) {
            currentRow.push(img);
          } else {
            const newRow = [];
            newRow.push(img);
            accu.push(newRow);
          }
          return accu;
        }, [[]] as Array<Array<ImageGalleryData>>)
      })
    );
  }

  private getNumColumns$() {
    return combineLatest([
      this.itemSize$$,
      this.bounds$$,
    ]).pipe(
      map(([itemSize, bounds]) => {
        const width = bounds.w;
        return Math.floor(width / itemSize);
      })
    )
  }

  private getIsLoading$(): Observable<boolean> {
    return this.loading$$.pipe(
      debounceTime(100)
    );
  }

  private decorateWithUrls(data: ImageMetadata): ImageGalleryData {
    return {
      ...data,
      smallUrl: ImageService.getImageUrl(data, ImageSize.SMALL),
      medUrl: ImageService.getImageUrl(data, ImageSize.MEDIUM),
      bigUrl: ImageService.getImageUrl(data, ImageSize.BIG),
      rawUrl: ImageService.getImageUrl(data, ImageSize.ORIGINAL)
    };
  }
}
