import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ImageMetadata, ImageSize} from "../../models/image.model";
import {ImageService} from "../../services/image.service";
import {BehaviorSubject, combineLatest, ReplaySubject, Subject} from "rxjs";
import {debounceTime, map, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  private mNumImages = 0;
  private mThumbSize = 256;
  private mMargin = 50;
  private mImages: Array<ImageMetadata> = [];

  @ViewChild('scrollwindow', {read: ElementRef})
  public scrollwindow?: ElementRef;

  @ViewChild('scrollpane', {read: ElementRef})
  public scrollpane?: ElementRef;

  @Input()
  public set numImages(n: number) {
    if (n != undefined) {
      this.mNumImages = n;
      this.recalculateDomElements();
    }
  }
  public get numImages() {
    return this.mNumImages;
  }

  @Input()
  public set images(i: Array<ImageMetadata>) {
    if (i) {
      this.mImages = i;
      this.recalculateDomElements();
    }
  }
  public get images() {
    return this.mImages;
  }

  @Input()
  public set thumbSize(s: number) {
    if (s != undefined) {
      this.mThumbSize = s;
      this.recalculateDomElements();
    }
  }
  public get thumbSize() {
    return this.mThumbSize;
  }

  @Input()
  public set margin(m: number) {
    if (m != undefined) {
      this.mMargin = m;
      this.recalculateDomElements();
    }
  }
  public get margin() {
    return this.mMargin;
  }

  private readonly rowTransforms$$ = new ReplaySubject<Record<number, string>>(1);
  private readonly rowImages$$ = new ReplaySubject<Record<number, Array<ImageMetadata>>>(1);
  public readonly domRows$$ = new ReplaySubject<Array<number>>(1);
  public readonly rowData$$ = combineLatest([this.rowTransforms$$, this.rowImages$$])
    .pipe(map(([transforms, images]) => ({transforms, images})));


  private readonly recalculate$$ = new BehaviorSubject<boolean>(true);
  private readonly recalculate$ = this.recalculate$$.pipe(
    debounceTime(100)
  );
  private readonly destroy$$ = new Subject<void>();
  private numRows: number = 0;
  private imagesPerRow: number = 0;

  public ngAfterViewInit(): void {
    this.recalculateDomElements();
  }

  public ngOnInit(): void {
    this.recalculate$.pipe(
      takeUntil(this.destroy$$)
    ).subscribe(() => {
      this.recalculateDomElementsImpl();
    });
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }


  public updateScroll(): void {
    const transforms: Record<number, string> = {};
    const images: Record<number, Array<ImageMetadata>> = {};
    for (let i = 0; i < this.numRows; i++) {
      transforms[i] = this.getRowTransform(i);
      images[i] = this.getRowImages(i);
    }
    this.rowTransforms$$.next(transforms);
    this.rowImages$$.next(images);
  }

  private getRowTransform(rowIdx: number): string {
    if (!this.scrollwindow || !this.scrollpane || !this.numImages) {
      return `0`;
    }
    const scrollTop = this.scrollwindow.nativeElement.scrollTop;
    const rowHeight = this.thumbSize + this.margin;
    const totalRowsHeight = this.numRows * rowHeight;

    const startTransform = (rowIdx - 2) * rowHeight;
    const scrollTopOffset = scrollTop % totalRowsHeight;
    const alteredByScrollTopTransform = startTransform - scrollTopOffset;
    const wraparoundTransform = (alteredByScrollTopTransform < -2 * rowHeight)
      ? (alteredByScrollTopTransform + totalRowsHeight)
      : alteredByScrollTopTransform;

    return `${wraparoundTransform}px`;
  }

  private getRowImages(rowIdx: number): Array<ImageMetadata> {
    if (!this.scrollwindow || !this.scrollpane || !this.numImages) {
      return [];
    }
    const scrolltop = this.scrollwindow.nativeElement.scrollTop;
    const rowHeight = this.thumbSize + this.margin;
    const heightOfAllRows = rowHeight * this.numRows;
    const distanceInPxBeforeRowWrapsAround = rowIdx * rowHeight;
    const distanceScrolledInCurrentWindow = scrolltop % heightOfAllRows;
    const fullyScrolledRowWindows = Math.floor(scrolltop / heightOfAllRows);

    const wraparound = (distanceInPxBeforeRowWrapsAround > distanceScrolledInCurrentWindow) ? 0 : 1;
    const newRowIdx = ((fullyScrolledRowWindows + wraparound) * this.numRows) + rowIdx;

    const finalIdx = newRowIdx - 2;

    if (finalIdx < 0) {
      return [];
    }
    const startIdx = finalIdx * this.imagesPerRow;
    const endIdx = startIdx + this.imagesPerRow;

    const images: Array<ImageMetadata> = [];
    for (let i = startIdx; i < endIdx; i++) {
      images.push(this.images[i]);
    }
    return images;
  }

  private recalculateDomElements(): void {
    this.recalculate$$.next(true);
  }

  private recalculateDomElementsImpl(): void {
    if (!this.scrollwindow || !this.scrollpane || !this.numImages) {
      return;
    }
    const windowBounds = this.scrollwindow.nativeElement.getBoundingClientRect();
    const imagesPerRow = Math.floor(windowBounds.width / (this.thumbSize + this.margin));
    const numRows = Math.ceil(this.numImages / imagesPerRow);
    const paneHeight = numRows * (this.thumbSize + this.margin);
    const numDomRows = Math.ceil(windowBounds.height / (this.thumbSize + this.margin)) + 4; // 2 rows extra at the top, 2 at the bottom
    const domRows: Array<number> = [];
    for (let i = 0; i < numDomRows; i++) {
      domRows[i] = i;
    }
    requestAnimationFrame(() => {
      this.scrollpane!.nativeElement.style.height = `${paneHeight}px`;
      this.numRows = domRows.length;
      this.imagesPerRow = imagesPerRow;
      this.domRows$$.next(domRows);
      this.updateScroll();
    });
  }

  public downloadImage(img: ImageMetadata): void {
    window.open(ImageService.getImageUrl(img, ImageSize.ORIGINAL), '');
  }

  public getImageUrl(image: ImageMetadata): string {
    return ImageService.getImageUrl(image, ImageSize.MEDIUM);
  }
}
