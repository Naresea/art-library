import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetUploadRoutingModule } from './asset-upload-routing.module';
import { AssetUploadComponent } from './asset-upload.component';
import {FormsModule} from "@angular/forms";
import { UploadAreaComponent } from './upload-area/upload-area.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AgGridModule} from "ag-grid-angular";
import { FileGridComponent } from './file-grid/file-grid.component';
import { UploadSidebarComponent } from './upload-sidebar/upload-sidebar.component';
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";


@NgModule({
  declarations: [
    AssetUploadComponent,
    UploadAreaComponent,
    FileGridComponent,
    UploadSidebarComponent
  ],
    imports: [
        CommonModule,
        AssetUploadRoutingModule,
        FormsModule,
        FontAwesomeModule,
        AgGridModule.withComponents([]),
        NgMultiSelectDropDownModule
    ]
})
export class AssetUploadModule { }
