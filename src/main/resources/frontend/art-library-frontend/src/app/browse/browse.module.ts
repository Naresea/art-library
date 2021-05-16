import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BrowseRoutingModule} from './browse-routing.module';
import {BrowseComponent} from './browse.component';
import {ImageSidebarComponent} from './image-sidebar/image-sidebar.component';
import {ImageGalleryComponent} from './image-gallery/image-gallery.component';
import {EditorModule, TINYMCE_SCRIPT_SRC} from '@tinymce/tinymce-angular';
import {LazyLoadImageModule} from "ng-lazyload-image";
import {FormsModule} from "@angular/forms";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {GalleryModule} from "@ks89/angular-modal-gallery";
import { ImageGalleryLibComponent } from './image-gallery-lib/image-gallery-lib.component';
import {InfiniteScrollModule} from "ngx-infinite-scroll";


@NgModule({
  declarations: [
    BrowseComponent,
    ImageSidebarComponent,
    ImageGalleryComponent,
    ImageGalleryLibComponent
  ],
  imports: [
    CommonModule,
    BrowseRoutingModule,
    LazyLoadImageModule,
    EditorModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    GalleryModule,
    InfiniteScrollModule
  ],
  providers: [
    {provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js'}
  ]
})
export class BrowseModule {
}
