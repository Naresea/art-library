import {Component} from '@angular/core';
import {BackendService} from "../backend-communication/backend.service";
import {BehaviorSubject} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-asset-upload',
  templateUrl: './asset-upload.component.html',
  styleUrls: ['./asset-upload.component.scss']
})
export class AssetUploadComponent {

  public readonly files$$ = new BehaviorSubject<Array<File>>([]);
  public readonly filesForUpload$$ = new BehaviorSubject<Array<File>>([]);
  public readonly uploadMetadata$ = this.filesForUpload$$.pipe(
    map((files) => {
      const totalSize = files.reduce((accu, f) => accu + f.size, 0);
      return {
        numFiles: files.length,
        totalSize: (totalSize / (1024 * 1024)).toFixed(1) + ' MB'
      }
    })
  );

  constructor(private readonly backendService: BackendService) { }

  public handleFileSelection(files: Array<File> | undefined): void {
    this.files$$.next(files ?? []);
  }

  public handleUploadFileSelection(files: Array<File> | undefined): void {
    this.filesForUpload$$.next(files ?? []);
  }
}
