import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {filter, map, startWith} from "rxjs/operators";
import {Transfer, TransferState} from "../models/backend.model";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private readonly httpClient: HttpClient) { }

  public create<T>(url: string, body: T): Observable<Transfer<T>> {
    return this.httpTransfer(
      this.httpClient.post<T>(
        url,
        body,
        {
          observe: 'events',
          reportProgress: true
        }
      )
    );
  }

  public read<T>(url: string): Observable<Transfer<T>> {
    return this.httpTransfer(
      this.httpClient.get<T>(
        url,
        {
          observe: 'events',
          reportProgress: true
        }
      )
    );
  }

  public update<T>(url: string, body: T): Observable<Transfer<T>> {
    return this.httpTransfer(
      this.httpClient.patch<T>(
        url,
        body,
        {
          observe: 'events',
          reportProgress: true
        }
      )
    );
  }

  public delete<T>(url: string): Observable<Transfer<T>> {
    return this.httpTransfer(
      this.httpClient.delete<T>(
        url,
        {
          observe: 'events',
          reportProgress: true
        }
      )
    );
  }

  private httpTransfer<T>(observable$: Observable<HttpEvent<T>>): Observable<Transfer<T>> {
    return observable$.pipe(
      map((evt) => {
        if (this.isHttpProgressEvent(evt)) {
          return {
            progress: evt.total
              ? Math.round((100 * evt.loaded) / evt.total)
              : evt.loaded,
            state: TransferState.PROGRESS
          };
        } else if (this.isHttpResponse(evt)) {
          return {
            progress: 100,
            state: TransferState.DONE,
            result: evt.body ?? undefined
          };
        } else {
          return undefined;
        }
      }),
      filter((v: Transfer<T> | undefined): v is Transfer<T> => v !== null && v !== undefined),
      startWith({
        progress: 0,
        state: TransferState.PENDING
      })
    );
  }

  private isHttpProgressEvent(evt: HttpEvent<unknown>): evt is HttpProgressEvent {
    return evt.type === HttpEventType.DownloadProgress || evt.type === HttpEventType.UploadProgress;
  }

  private isHttpResponse<T>(evt: HttpEvent<T>): evt is HttpResponse<T> {
    return evt.type === HttpEventType.Response;
  }

}
