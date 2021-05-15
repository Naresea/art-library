import {Injectable, OnDestroy} from "@angular/core";
import {ReplaySubject, Subject} from "rxjs";
import {ImageMetadata, ImageSize, Page, QueryMethod} from "../models/image.model";
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
  private readonly images$$ = new ReplaySubject<Array<ImageMetadata>>(1);
  private pageSize = 200;
  private page = 0;
  private tags: Array<string> = [];
  private isFirstPage = true;
  private isLastPage = false;
  private query: QueryMethod = QueryMethod.HAS_ALL_OF;

  public readonly images$ = this.images$$.asObservable();

  constructor(private readonly backendService: BackendService) {
    this.searchImpl(QueryMethod.HAS_ALL_OF);
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public search(query: QueryMethod, searchString: string): void {
    this.page = 0;
    this.isLastPage = false;
    this.isFirstPage = true;
    const tags = searchString.split(/\s+/g);
    this.searchImpl(query, ...tags);
  }

  public nextPage(): void {
    if (this.isLastPage) {
      return;
    }
    this.page++;
    this.searchImpl(this.query, ...this.tags);
  }

  public prevPage(): void {
    if (this.isFirstPage) {
      return;
    }
    this.page--;
    this.searchImpl(this.query, ...this.tags);
  }

  private searchImpl(query: QueryMethod, ...tags: Array<string>): void {
    this.tags = tags;
    this.query = query;
    const url =`${environment.apiUrl}/images/search?query=${this.query}&page=${this.page}&size=${this.pageSize}&tags=${this.tags.join(',')}`;
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
        this.images$$.next(page.content);
      });
  }
}
