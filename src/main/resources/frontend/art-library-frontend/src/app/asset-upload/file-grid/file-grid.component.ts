import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Observable, of, ReplaySubject} from "rxjs";
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  RowDataChangedEvent,
  SelectionChangedEvent
} from "ag-grid-community";
import {map} from "rxjs/operators";
import {TaggedElem} from "../../models/tags.model";

interface Row {
  filename: string;
  filesize: string;
  filetype: string;
  rawsize: number;
  file: TaggedElem<File>;
  tags: Array<string>;
  selectedTags: Array<string>;
}

@Component({
  selector: 'app-file-grid',
  templateUrl: './file-grid.component.html',
  styleUrls: ['./file-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileGridComponent {

  public readonly gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      // allow every column to be aggregated
      enableValue: true,
      // allow every column to be grouped
      enableRowGroup: true,
      // allow every column to be pivoted
      enablePivot: true,
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    onGridReady: (event: GridReadyEvent) => {
      event.api.sizeColumnsToFit();
      event.api.selectAll();
      this.gridApi = event.api;
    },
    onRowDataChanged: (event: RowDataChangedEvent) => {
      event.api.selectAll();
    },
    onSelectionChanged: (event: SelectionChangedEvent) => {
      const files: Array<TaggedElem<File>> = [];
      event.api.forEachLeafNode(rowNode => {
        if (rowNode.isSelected() && !rowNode.group) {
          const file = rowNode.data.file;
          const tags = rowNode.data.selectedTags;
          if (file) {
            files.push({
              payload: file.payload,
              tags: tags
            });
          }
        }
      });
      this.uploadFilesSelected.emit(files);
    }
  };


  private gridApi?: GridApi;
  private readonly files$$ = new ReplaySubject<Array<TaggedElem<File>>>(1);
  public readonly columnDefs$ = this.getColumnDefs$();
  public readonly rowData$ = this.getRowData$();

  @Input()
  public set files(f: Array<TaggedElem<File>> | undefined | null) {
    if (f) {
      this.files$$.next(f);
    }
  }

  @HostListener('click', ['$event'])
  public onClick(evt: Event): void {
    if (evt.target && (evt.target as HTMLElement).classList?.contains('al-toggle-tag-button')) {
      evt.preventDefault();
      evt.stopPropagation();
      this.toggleTag(evt.target as HTMLElement);
    }
  }

  @Output()
  public uploadFilesSelected = new EventEmitter<Array<TaggedElem<File>>>();

  private getColumnDefs$(): Observable<Array<ColDef>> {
    return of([
      {
        headerName: 'File',
        field: 'filename',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true
      },
      {
        headerName: 'Size',
        field: 'filesize',
        sort: 'desc',
        comparator: (valA, valB, nodeA, nodeB) => {
          return nodeA.data.rawsize - nodeB.data.rawsize;
        }
      },
      {
        headerName: 'Type',
        field: 'filetype'
      },
      {
        headerName: 'Tags',
        field: 'tags',
        cellRenderer: (params: ICellRendererParams) => {
          const node = params.node;
          const tags = node.data.tags ?? [];
          const elem = document.createElement('div');
          elem.style.height = '100%';
          const tagElems = tags.map((tag: string) => {
            return `
            <div class="border border-primary rounded-pill d-flex align-items-center al-toggle-tag-button ${node.data.selectedTags.includes(tag) ? 'tag-selected' : ''}"
                 style="height: 1.5rem; padding: 5px; margin-right: 0.5rem; cursor: pointer;"
                 data-tag="${tag}" data-node="${node.id}"
                 >
                ${tag}
            </div>
            `;
          }).join('');
          elem.innerHTML = `
            <div class="d-flex flex-row align-items-center w-100 h-100">
                ${tagElems}
            </div>
          `;
          return elem;
        }
      }
    ]);
  }

  private getRowData$(): Observable<Array<Row>> {
    return this.files$$.pipe(
      map((files) =>
        files.map(f => {
          const size = f.payload.size;
          const readableSize = size > 1024 * 1024
            ? (size / (1024 * 1024)).toFixed(1) + ' MB'
            : (size / 1024).toFixed(1) + ' KB';

          return {
            filename: f.payload.name,
            filetype: f.payload.type,
            filesize: readableSize,
            rawsize: size,
            file: f,
            tags: f.tags,
            selectedTags: f.tags
          }
        })
      )
    );
  }

  private toggleTag(currentTarget: HTMLElement): void {
    const tag = currentTarget.dataset['tag'];
    const nodeId = currentTarget.dataset['node'];
    if (!tag || !nodeId || !this.gridApi) {
      console.log('Click failed: ', {tag, nodeId, api: this.gridApi});
      return;
    }
    const node = this.gridApi.getRowNode(nodeId);
    if (!node || !node.data.selectedTags || !node.data.file) {
      console.log('No node.');
      return;
    }

    if (node.data.selectedTags.includes(tag)) {
      node.data.selectedTags = node.data.selectedTags.filter((t: string) => t !== tag);
    } else {
      node.data.selectedTags.push(tag);
    }
    this.gridApi.redrawRows({
      rowNodes: [node]
    });
  }
}
