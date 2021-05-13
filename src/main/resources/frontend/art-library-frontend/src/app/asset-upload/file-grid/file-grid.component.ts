import {ChangeDetectionStrategy, Component, Input, Output, EventEmitter} from '@angular/core';
import {Observable, of, ReplaySubject} from "rxjs";
import {ColDef, GridOptions, GridReadyEvent, RowDataChangedEvent, SelectionChangedEvent} from "ag-grid-community";
import {TransferState} from "../../backend-communication/backend.model";
import {map} from "rxjs/operators";

interface Row {
  filename: string;
  filesize: string;
  filetype: string;
  rawsize: number;
  file: File;
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
    },
    onRowDataChanged: (event: RowDataChangedEvent) => {
      event.api.selectAll();
    },
    onSelectionChanged: (event: SelectionChangedEvent) => {
      const files: Array<File> = [];
      event.api.forEachLeafNode(rowNode => {
        if (rowNode.isSelected() && !rowNode.group) {
          const file = rowNode.data.file;
          if (file) {
            files.push(file);
          }
        }
      });
      this.uploadFilesSelected.emit(files);
    }
  };


  private readonly files$$ = new ReplaySubject<Array<File>>(1);
  public readonly columnDefs$ = this.getColumnDefs$();
  public readonly rowData$ = this.getRowData$();

  @Input()
  public set files(f: Array<File> | undefined | null) {
    if (f) {
      this.files$$.next(f);
    }
  }

  @Output()
  public uploadFilesSelected = new EventEmitter<Array<File>>();

  private getColumnDefs$(): Observable<Array<ColDef>> {
    return of([
      {
        headerName: 'File',
        field: 'filename',
        checkboxSelection: true,
        headerCheckboxSelection: true
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
      }
    ]);
  }

  private getRowData$(): Observable<Array<Row>> {
    return this.files$$.pipe(
      map((files) =>
        files.map(f => ({
          filename: f.name,
          filetype: f.type,
          filesize: f.size > 1024 * 1024 ? (f.size / (1024 * 1024)).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB',
          rawsize: f.size,
          file: f
        }))
      )
    );
  }
}
