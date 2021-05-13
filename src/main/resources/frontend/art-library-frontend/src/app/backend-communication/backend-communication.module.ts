import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HttpClientXsrfModule} from "@angular/common/http";
import {BackendService} from "./backend.service";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions()
  ],
  providers: [
    BackendService
  ]
})
export class BackendCommunicationModule { }
