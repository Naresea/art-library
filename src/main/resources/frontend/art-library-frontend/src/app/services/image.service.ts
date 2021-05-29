import {Injectable, OnDestroy} from "@angular/core";
import {ReplaySubject, Subject} from "rxjs";
import {ImageMetadata, ImageMetadataUpdate, ImageSize, Page, QueryMethod} from "../models/image.model";
import {environment} from "../../environments/environment";
import {BackendService} from "./backend.service";
import {filter, take, takeUntil} from "rxjs/operators";
import {TransferState} from "../models/backend.model";

@Injectable({
  providedIn: 'root'
})
export class ImageService implements OnDestroy {


  public static getImageUrl(img: ImageMetadata, size: ImageSize): string {
    return `${environment.apiUrl}/images/${img.id}/bin/${size}/${encodeURI(img.title ?? 'unknown')}`;
  }

  private readonly destroy$$ = new Subject<void>();
  private readonly imagePage$$ = new ReplaySubject<Page<ImageMetadata> | undefined>(1);
  private pageSize = 100;
  private page = 0;
  private isFirstPage = true;
  private isLastPage = false;
  private luceneQuery?: string;

  public readonly imagePage$ = this.imagePage$$.asObservable();

  constructor(private readonly backendService: BackendService) {}

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public searchLucene(query: string): void {
    this.page = 0;
    this.luceneQuery = query;
    this.isLastPage = false;
    this.isFirstPage = true;
    this.imagePage$$.next(undefined);
    this.searchLuceneImpl(query);
  }

  public updateImage(image: ImageMetadataUpdate): void {
    this.backendService.update(
      `${environment.apiUrl}/images/${image.id}`,
      {...image, id: undefined}
    ).pipe(
      takeUntil(this.destroy$$)
    ).subscribe();
  }

  public deleteImage(id: number): void {
    this.backendService.delete(
      `${environment.apiUrl}/images/${id}`
    ).pipe(
      takeUntil(this.destroy$$)
    ).subscribe();
  }

  public getPage(pageNumber: number): void {
    if (this.luceneQuery == null) {
      return;
    }
    this.page = pageNumber;
    this.searchLuceneImpl(this.luceneQuery);
  }

  public nextPage(): void {
    if (this.luceneQuery == null) {
      return;
    }
    this.page++;
    this.searchLuceneImpl(this.luceneQuery);
  }

  private searchLuceneImpl(query: string): void {
    this.luceneQuery = query;
    const url =`${environment.apiUrl}/images/search?page=${this.page}&size=${this.pageSize}&query=${this.luceneQuery}`;
    this.backendService.read<Page<ImageMetadata>>(url)
      .pipe(
        filter((res) => res.state === TransferState.DONE && !!res.result),
        take(1),
        takeUntil(this.destroy$$)
      ).subscribe((pageTransfer) => {
      const page = pageTransfer.result;
      if (!page) {
        return;
      }
      this.isFirstPage = page.first;
      this.isLastPage = page.last;
      this.page = page.number;
      this.imagePage$$.next(page);
    });
  }
}
