import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadRoutingModule } from './upload-routing.module';
import { UploadComponent } from './upload.component';
import {MatStepperModule} from "@angular/material/stepper";
import { AddFilesComponent } from './add-files/add-files.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {MatIconModule} from "@angular/material/icon";
import { FileTreeComponent } from './file-tree/file-tree.component';
import {MatListModule} from "@angular/material/list";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MultiselectModule} from "../widgets/multiselect/multiselect.module";
import {MatButtonModule} from "@angular/material/button";
import { UploadToBackendComponent } from './upload-to-backend/upload-to-backend.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { UploadEditSheetComponent } from './upload-edit-sheet/upload-edit-sheet.component';
import {EditorModule, TINYMCE_SCRIPT_SRC} from "@tinymce/tinymce-angular";
import {FormsModule} from "@angular/forms";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";


@NgModule({
  declarations: [
    UploadComponent,
    AddFilesComponent,
    FileTreeComponent,
    UploadToBackendComponent,
    UploadEditSheetComponent
  ],
  imports: [
    CommonModule,
    UploadRoutingModule,
    MatStepperModule,
    FontAwesomeModule,
    MatIconModule,
    MatListModule,
    ScrollingModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MultiselectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    EditorModule,
    FormsModule,
    MatBottomSheetModule
  ],
  providers: [
    {provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js'}
  ]
})
export class UploadModule { }
