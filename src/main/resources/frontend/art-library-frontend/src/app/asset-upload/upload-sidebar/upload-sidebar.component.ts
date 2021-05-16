import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ImageCategory, ImageTagMetadata} from "../../models/image.model";
import {IDropdownSettings} from "ng-multiselect-dropdown";

@Component({
  selector: 'app-upload-sidebar',
  templateUrl: './upload-sidebar.component.html',
  styleUrls: ['./upload-sidebar.component.scss']
})
export class UploadSidebarComponent {

  public readonly CATEGORIES = ImageCategory;

  public readonly multiselectSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  public readonly categorySettings = {
    ...this.multiselectSettings,
    singleSelection: true
  };

  @Input()
  public knownTags?: Array<ImageTagMetadata> | null = [];

  @Output()
  public values = new EventEmitter<{tags: Array<string>, category: ImageCategory}>();

  public selectedTags: Array<{item_id: number | undefined, item_text: string}> = [];

  public selectedCategory: ImageCategory = ImageCategory.ARTWORK;

  private mTags: Array<string> = [];

  public get tags() {
    return this.mTags.join(', ');
  }
  public set tags(t: string) {
    this.mTags = t.split(',').map(v => v.trim());
  }

  public get categories() {
    return [
      { item_id: 0, item_text: ImageCategory.TOKEN },
      { item_id: 1, item_text: ImageCategory.BATTLEMAP },
      { item_id: 2, item_text: ImageCategory.ARTWORK },
    ]
  }

  public get existingTags() {
    return (this.knownTags ?? []).map(t => ({
      item_id: t.id,
      item_text: t.name
    }));
  }

  public update(): void {
    this.values.emit({
      tags: this.mTags,
      category: this.selectedCategory
    });
  }

}
