import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {HttpClientModule, HttpClientXsrfModule} from "@angular/common/http";
import {LazyLoadImageModule} from "ng-lazyload-image";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";

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
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
