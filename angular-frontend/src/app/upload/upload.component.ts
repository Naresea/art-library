import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {AutoTagService} from "../services/auto-tag.service";
import {TaggedElem} from "../models/tags.model";
import {delay, filter, map, repeat, startWith, switchMap, take, takeUntil, tap} from "rxjs/operators";

import * as JSZip from "jszip";
import {environment} from "../../environments/environment";
import {BackendService} from "../services/backend.service";
import {ProgressReport, Transfer, TransferState} from "../models/backend.model";
import {UploadMetadata} from "../models/image.model";
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {UploadEditData, UploadEditSheetComponent} from "./upload-edit-sheet/upload-edit-sheet.component";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent implements OnDestroy {

  private isUploading = false;

  public readonly uploadDone$$ = new BehaviorSubject<boolean>(false);
  public readonly uploadProgress$$ = new BehaviorSubject<number>(0);
  public readonly uploadStep$$ = new BehaviorSubject<string>('Compressing...');
  public readonly files$$ = new BehaviorSubject<Array<TaggedElem<File>> | undefined>(undefined);
  public readonly selectedFiles$$ = new BehaviorSubject<Array<TaggedElem<File>> | undefined>(undefined);
  public readonly hasSelectedFiles$ = this.selectedFiles$$.pipe(
    map(files => !!files && files.length > 0),
    startWith(false)
  )

  private readonly destroy$$ = new Subject<void>();
  private sheet?: MatBottomSheetRef<unknown, unknown>;
  private uploadMetadata?: UploadEditData;

  constructor(
    private readonly autoTagService: AutoTagService,
    private readonly backendService: BackendService,
    private readonly matBottomSheet: MatBottomSheet
  ) { }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public async readFiles(files: Array<File>): Promise<void> {
    const mappedToGuessElement = files.map(f => ({name: f.name, payload: f}));
    const taggedFiles = await this.autoTagService.guessTags(mappedToGuessElement);
    this.files$$.next(taggedFiles);
  }

  public selectFiles(files: Array<TaggedElem<File> & {checked: boolean}>) {
    this.selectedFiles$$.next(files.filter(f => f.checked));
  }

  public async startUpload(): Promise<void> {
    if (this.isUploading) {
      return;
    }
    this.isUploading = true;
    const toUpload = this.selectedFiles$$.getValue();
    if (!toUpload) {
      this.isUploading = false;
      return;
    }
    const metadata = this.buildFileMetadata(toUpload);
    const zip = await this.buildUploadZip(toUpload, metadata);

    const formData = new FormData();
    formData.append('imageFiles', zip);

    this.uploadStep$$.next('Uploading to server');
    this.uploadProgress$$.next(0)
    await this.backendService.create<{uuid: string}>(`${environment.apiUrl}/images/upload`, formData).pipe(
      tap((event) => {
        if (event && event.progress) {
          this.uploadProgress$$.next(event.progress);
        }
      }),
      filter(evt => evt.state === TransferState.DONE && !!evt.result),
      tap(evt => console.log('Received result: ', evt.result)),
      switchMap((evt: Transfer<{uuid: string}>) => {
        const uuid = evt.result!.uuid;
        return this.backendService.read<ProgressReport>(`${environment.apiUrl}/images/progress/${uuid}`).pipe(
          delay(1000),
          repeat()
        );
      }),
      map((progress: Transfer<ProgressReport>) => progress.result),
      filter((p: ProgressReport | undefined): p is ProgressReport => p != null),
      tap((progress: ProgressReport) => {
        console.log('Received report: ', progress);
        const percentage = 100 * ((progress.failed + progress.success) / progress.total);
        this.uploadProgress$$.next(percentage);
        this.uploadStep$$.next(`Processing: ${percentage.toFixed(2)}`);
      }),
      filter((progressReport: ProgressReport) => {
        return progressReport.success + progressReport.failed >= progressReport.total;
      }),
      take(1)
    ).toPromise()
      .then(() => this.uploadDone$$.next(true));
  }

  private buildFileMetadata(files: Array<TaggedElem<File>>): UploadMetadata {
    const categories = this.uploadMetadata?.categories ?? ['uncategorized'];
    const tags: Array<string> = this.uploadMetadata?.tags ?? [];
    const description: string = this.uploadMetadata?.description ?? '';

    const uploadFiles = files.reduce((accu, file) => {
      accu[file.payload.name] = { tags: Array.from(new Set([...file.tags])), categories: [] };
      return accu;
    }, {} as any);
    return {
      categories,
      tags,
      description,
      files: uploadFiles
    };
  }

  private async buildUploadZip(files: Array<TaggedElem<File>>, metadata: UploadMetadata): Promise<any> {
    const zip = new JSZip();
    zip.file('al-metadata.json', JSON.stringify(metadata));
    files.forEach(f => zip.file(f.payload.name, f.payload));
    return zip.generateAsync({
      type: 'blob',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: {
        level: 1
      }
    }, (updateMetadata) => {
      this.uploadProgress$$.next(updateMetadata.percent);
      this.uploadStep$$.next('Compressing ' + updateMetadata.currentFile);
    });
  }

  public editMetadata(): void {
    this.sheet = this.matBottomSheet.open(UploadEditSheetComponent, {
      data: this.uploadMetadata
    });
    this.sheet.afterDismissed().pipe(
      takeUntil(this.destroy$$)
    ).subscribe((result) => {
      if (result != null) {
        this.uploadMetadata = result as UploadEditData;
      }
    });
  }
}
