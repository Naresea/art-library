import {Component, OnDestroy} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {map, switchMap, take, takeUntil} from "rxjs/operators";
import {TaggedElem} from "../models/tags.model";
import {AutoTagService} from "../services/auto-tag.service";
import {UploadMetadata} from "./upload.model";
import * as JSZip from 'jszip';
import {BackendService} from "../services/backend.service";
import {environment} from "../../environments/environment";
import {Transfer, TransferState} from "../models/backend.model";
import {TagService} from "../services/tag.service";
import {ImageCategory} from "../models/image.model";

@Component({
  selector: 'app-asset-upload',
  templateUrl: './asset-upload.component.html',
  styleUrls: ['./asset-upload.component.scss']
})
export class AssetUploadComponent implements OnDestroy {

  private readonly destroy$$ = new Subject<void>();
  public readonly tags$ = this.tagService.tags$;
  public readonly zipProgress$$ = new ReplaySubject<{progress: string, file: string}>(1);
  public readonly uploadProgress$$ = new ReplaySubject<Transfer<unknown>>(1);
  public readonly uploadStage$$ = new ReplaySubject<'zip' | 'upload'>(1);
  public readonly isUploading$$ = new BehaviorSubject<boolean>(false);
  public readonly cancelUpload$$ = new Subject<void>();
  public readonly files$$ = new BehaviorSubject<Array<TaggedElem<File>>>([]);
  public readonly filesForUpload$$ = new BehaviorSubject<Array<TaggedElem<File>>>([]);
  public readonly uploadMetadata$ = this.filesForUpload$$.pipe(
    map((files) => {
      const totalSize = files.reduce((accu, f) => accu + f.payload.size, 0);
      return {
        numFiles: files.length,
        totalSize: (totalSize / (1024 * 1024)).toFixed(1) + ' MB',
        tooBig: totalSize > 1073741824
      }
    })
  );

  private tagsForAllElements: Array<string> = [];
  private categoryForAllElements: string = '';

  constructor(
    private readonly autoTagService: AutoTagService,
    private readonly tagService: TagService,
    private readonly backendService: BackendService
  ) { }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public handleFileSelection(files: Array<File> | undefined): void {
    this.autoTagService.guessTags(
      (files ?? []).map(f => ({payload: f, name: f.name}))
    ).then((tagged) => {
      this.files$$.next(tagged);
    });
  }

  public handleUploadFileSelection(files: Array<TaggedElem<File>> | undefined): void {
    this.filesForUpload$$.next(files ?? []);
  }

  public clear(): void {
    this.files$$.next([]);
  }

  public upload(): void {
    this.isUploading$$.next(true);
    this.uploadStage$$.next('zip');

    this.filesForUpload$$.pipe(
      take(1),
      switchMap((files) => {
        const metadata = this.buildFileMetadata(files);
        return this.buildUploadZip(files, metadata);
      }),
      switchMap((zip) => {
        // wrap in form data for multipart upload
        const formData = new FormData();
        formData.append('imageFiles', zip);
        this.uploadStage$$.next('upload');
        return this.backendService.create(`${environment.apiUrl}/images/upload`, formData)
      }),
      takeUntil(this.cancelUpload$$),
      takeUntil(this.destroy$$)
    ).subscribe((evt) => {
      if (evt.state === TransferState.DONE) {
        this.isUploading$$.next(false);
        this.clear();
      }
      this.uploadProgress$$.next(evt);
    });
  }

  private buildFileMetadata(files: Array<TaggedElem<File>>): UploadMetadata {
    const category = this.categoryForAllElements;
    const tags = this.tagsForAllElements;

    console.log('Sending tags and categories: ', {category, tags});

    return files.reduce((accu, file) => {
      accu[file.payload.name] = { tags: Array.from(new Set([...file.tags, ...tags])), category };
      return accu;
    }, {} as any);
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
      this.zipProgress$$.next({
        progress: updateMetadata.percent.toFixed(2) + " %",
        file: updateMetadata.currentFile ?? 'Unknown'
      });
    });
  }

  public updateValue(values: { tags: Array<string>; category: ImageCategory }): void {
    this.tagsForAllElements = values.tags;
    this.categoryForAllElements = values.category;
  }
}
