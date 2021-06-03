import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MultiselectComponent} from './multiselect/multiselect.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [
    MultiselectComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  exports: [
    MultiselectComponent
  ]
})
export class MultiselectModule { }
