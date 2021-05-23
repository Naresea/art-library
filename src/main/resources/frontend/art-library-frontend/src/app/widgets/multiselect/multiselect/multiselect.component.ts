import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {debounceTime, map} from "rxjs/operators";

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent {

  @ViewChild('inputField', {read: ElementRef})
  public inputField?: ElementRef;

  private idCounter = 0;
  private readonly inputValue$$ = new ReplaySubject<string>(1);
  private readonly inputValue$ = this.inputValue$$.pipe(
    debounceTime(100)
  );

  @Input()
  public options: Array<{id: number, label: string}> = [];

  @Input()
  public label: string = '';

  @Input()
  public placeholder: string = '';

  @Input()
  public selectedItems: Array<{id: number, label: string}> = [];

  @Output()
  public selectedItemsChange = new EventEmitter<Array<{id: number, label: string}>>();

  @Input()
  public separatorKeyCodes: Array<number> = [ENTER, COMMA];

  public readonly filteredOptions$ = this.getFilteredOptions$();

  public removeItem(item: { id: number; label: string }): void {
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    this.selectedItemsChange.emit(this.selectedItems);
  }

  public addItem(evt: MatChipInputEvent): void {
    const label = evt.value;

    if (!label || label.trim().length < 1) {
      return;
    }

    const existing = this.selectedItems.some(i => i.label === label);
    if (existing) {
      return;
    }

    const opt = this.options.find(o => o.label === label);
    if (opt) {
      this.selectedItems.push(opt);
    } else {
      const id = --this.idCounter;
      this.selectedItems.push({id, label});
    }
    this.selectedItemsChange.emit(this.selectedItems);
    this.clearInput();
  }

  public selectedItem(evt: MatAutocompleteSelectedEvent): void {
    const existing = this.selectedItems.some(i => i.label === evt.option.value.label);
    if (existing) {
      return;
    }

    this.selectedItems.push(evt.option.value);
    this.selectedItemsChange.emit(this.selectedItems);
    this.clearInput();
  }

  private clearInput(): void {
    if (this.inputField) {
      this.inputField.nativeElement.value = '';
    }
  }

  private getFilteredOptions$(): Observable<Array<{id: number, label: string}>> {
    return this.inputValue$.pipe(
      map((input) => {
        return this.options
          .filter(opt => opt.label.toLowerCase().includes(input.toLowerCase()))
          .filter(opt => !this.selectedItems.some(i => i.id === opt.id))
      })
    );
  }

  public updateFilter(value: string): void {
    this.inputValue$$.next(value);
  }
}
