import {Injectable} from "@angular/core";
import {BackendService} from "./backend.service";
import {ReplaySubject} from "rxjs";
import {ImageTagMetadata} from "../models/image.model";
import {environment} from "../../environments/environment";
import {filter} from "rxjs/operators";
import {TransferState} from "../models/backend.model";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  private readonly tags$$ = new ReplaySubject<Array<ImageTagMetadata>>(1);
  public readonly tags$ = this.tags$$.asObservable();

  constructor(private readonly backendService: BackendService) {
    this.backendService.read<Array<ImageTagMetadata>>(
      `${environment.apiUrl}/tags`
    ).pipe(
      filter(evt => evt.state === TransferState.DONE && !!evt.result)
    ).subscribe((evt) => {
      this.tags$$.next(evt.result);
    })
  }

}
