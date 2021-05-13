import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild
} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import {faUpload} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-upload-area',
  templateUrl: './upload-area.component.html',
  styleUrls: ['./upload-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadAreaComponent {

  public readonly upload = faUpload;
  private readonly isHovering$$ = new BehaviorSubject<boolean>(false);
  public readonly isHovering$ = this.isHovering$$.pipe(
    distinctUntilChanged()
  );

  @Output()
  public filesSelected = new EventEmitter<Array<File>>();

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: Event): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.isHovering$$.next(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: Event): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.isHovering$$.next(false);
  }

  @HostListener('drop', ['$event'])
  public async onDragDrop(evt: Event): Promise<void> {
    evt.preventDefault();
    evt.stopPropagation();
    this.isHovering$$.next(false);
    const items = (evt as DragEvent).dataTransfer?.items;
    if (!items) {
      return;
    }

    const readPromises = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        readPromises.push(this.traverseFileTree(item));
      }
    }

    const files: Array<File> = (await Promise.all(readPromises))
      .reduce((accu, curr) => {
        accu.push(...curr);
        return accu;
      }, []);


    this.emitFiles(files);
  }

  @ViewChild('fileInput', {read: ElementRef})
  public fileInput?: ElementRef<HTMLInputElement>;

  public updateSelectedFile(): void {
    if (!this.fileInput || !this.fileInput.nativeElement) {
      return;
    }
    const fileList = this.fileInput.nativeElement.files ?? undefined;
    if (!fileList) {
      return;
    }
    const result: Array<File> = [];
    for (let i = 0; i < fileList.length; i++) {
      const item = fileList.item(i);
      if (item) {
        result.push(item);
      }
    }
    this.emitFiles(result);
  }

  private emitFiles(files: Array<File>): void {
    const filtered = files.filter(f => {
      return f.type.includes('image');
    });
    this.filesSelected.emit(filtered);
  }

  private readFileFromItem(item: any): Promise<File> {
    return new Promise((resolve) => {
      item.file((file: File) => resolve(file));
    });
  }

  private readEntriesFromItem(item: any): Promise<any> {
    return new Promise(resolve => {
      const dirReader = item.createReader();
      dirReader.readEntries((entries: any) => {
        resolve(entries);
      });
    });
  }

  private async traverseFileTree(item: any, path?: string): Promise<Array<File>> {
    path = path || '';
    const result: Array<File> = [];

    if (item.isFile) {
      result.push(await this.readFileFromItem(item));
    } else if (item.isDirectory) {
      const entries = await this.readEntriesFromItem(item);
      const promises = [];
      for (let i = 0; i < entries.length; i++) {
        promises.push(this.traverseFileTree(entries[i], path + item.name + '/'));
      }
      const files: Array<Array<File>> = await Promise.all(promises);
      files.forEach(f => result.push(...f));
    }
    return result;
  }

}
