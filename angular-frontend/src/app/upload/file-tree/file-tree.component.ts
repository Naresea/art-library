import {ChangeDetectionStrategy, Component, Input, Output, EventEmitter} from '@angular/core';
import {TaggedElem} from "../../models/tags.model";

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileTreeComponent {

  public items: Array<TaggedElem<File> & {checked: boolean}> = [];

  @Input()
  public set files(files: Array<TaggedElem<File>>) {
    this.items = files.map(f => ({
      ...f,
      checked: true
    }));
    this.selectionChange.emit(this.items);
  }

  @Output()
  public selectionChange = new EventEmitter<Array<TaggedElem<File> & { checked: boolean }>>();

  public updateCheck(file: TaggedElem<File> & {checked: boolean}): void {
    file.checked = !file.checked;
    this.selectionChange.emit(this.items);
  }
}
