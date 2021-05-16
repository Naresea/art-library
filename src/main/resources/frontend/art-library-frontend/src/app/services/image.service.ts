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
    return `${environment.apiUrl}/images/${img.id}/bin/${size}`;
  }

  private readonly destroy$$ = new Subject<void>();
  private readonly imagePage$$ = new ReplaySubject<Page<ImageMetadata> | undefined>(1);
  private pageSize = 50;
  private page = 0;
  private tags: Array<string> = [];
  private categories: Array<string> = [];
  private isFirstPage = true;
  private isLastPage = false;
  private query: QueryMethod = QueryMethod.HAS_ALL_OF;

  public readonly imagePage$ = this.imagePage$$.asObservable();

  constructor(private readonly backendService: BackendService) {
    this.searchImpl(QueryMethod.HAS_ALL_OF);
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public search(query: QueryMethod, tags: Array<string>, category: Array<string>): void {
    this.page = 0;
    this.isLastPage = false;
    this.isFirstPage = true;
    this.imagePage$$.next(undefined);
    this.searchImpl(query, tags, category);
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
    this.page = pageNumber;
    this.searchImpl(this.query, this.tags, this.categories);
  }

  public nextPage(): void {
    this.page++;
    this.searchImpl(this.query, this.tags, this.categories);
  }

  private searchImpl(query: QueryMethod, tags?: Array<string>, categories?: Array<string>): void {
    this.tags = tags ?? [];
    this.categories = categories ?? [];
    this.query = query;
    const url =`${environment.apiUrl}/images/search?query=${this.query}&page=${this.page}&size=${this.pageSize}&tags=${this.tags.join(',')}&categories=${this.categories.join(',')}`;
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
