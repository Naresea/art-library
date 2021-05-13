import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetUploadRoutingModule } from './asset-upload-routing.module';
import { AssetUploadComponent } from './asset-upload.component';
import {FormsModule} from "@angular/forms";
import { UploadAreaComponent } from './upload-area/upload-area.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AgGridModule} from "ag-grid-angular";
import { FileGridComponent } from './file-grid/file-grid.component';


@NgModule({
  declarations: [
    AssetUploadComponent,
    UploadAreaComponent,
    FileGridComponent
  ],
    imports: [
        CommonModule,
        AssetUploadRoutingModule,
        FormsModule,
        FontAwesomeModule,
        AgGridModule.withComponents([])
    ]
})
export class AssetUploadModule { }
