import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GalleryRoutingModule} from './gallery-routing.module';
import {GalleryComponent} from './gallery.component';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {InfiniteImageGalleryComponent} from './infinite-image-gallery/infinite-image-gallery.component';
import {ImageDetailsComponent} from './image-details/image-details.component';
import {ImageEditSheetComponent} from './image-details/image-edit-sheet/image-edit-sheet.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {AngularMultiSelectModule} from "angular2-multiselect-dropdown";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatChipsModule} from "@angular/material/chips";
import {MultiselectModule} from "../widgets/multiselect/multiselect.module";
import {EditorModule, TINYMCE_SCRIPT_SRC} from "@tinymce/tinymce-angular";


@NgModule({
  declarations: [
    GalleryComponent,
    InfiniteImageGalleryComponent,
    ImageDetailsComponent,
    ImageEditSheetComponent
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    ScrollingModule,
    MatListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule,
    AngularMultiSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatChipsModule,
    MultiselectModule,
    EditorModule
  ],
  providers: [
    {provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js'}
  ]
})
export class GalleryModule { }
