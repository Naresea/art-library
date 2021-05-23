import {NgModule} from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {HttpClientModule, HttpClientXsrfModule} from "@angular/common/http";
import {LazyLoadImageModule} from "ng-lazyload-image";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import 'hammerjs';
import 'mousetrap';
import {GalleryModule} from '@ks89/angular-modal-gallery';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions(),
    LazyLoadImageModule,
    NgMultiSelectDropDownModule.forRoot(),
    GalleryModule.forRoot(),
    HammerModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
