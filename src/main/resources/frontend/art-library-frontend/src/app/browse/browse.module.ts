import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BrowseRoutingModule} from './browse-routing.module';
import {BrowseComponent} from './browse.component';
import {ImageSidebarComponent} from './image-sidebar/image-sidebar.component';
import {ImageGalleryComponent} from './image-gallery/image-gallery.component';
import {LazyLoadImageModule} from "ng-lazyload-image";


@NgModule({
  declarations: [
    BrowseComponent,
    ImageSidebarComponent,
    ImageGalleryComponent
  ],
    imports: [
        CommonModule,
        BrowseRoutingModule,
        LazyLoadImageModule
    ]
})
export class BrowseModule { }
