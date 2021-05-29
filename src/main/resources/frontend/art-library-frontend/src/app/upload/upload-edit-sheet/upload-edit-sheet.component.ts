import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {map} from "rxjs/operators";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {TagService} from "../../services/tag.service";

export interface UploadEditData {
  categories: Array<string>;
  tags: Array<string>;
  description: string;
}

@Component({
  selector: 'app-upload-edit-sheet',
  templateUrl: './upload-edit-sheet.component.html',
  styleUrls: ['./upload-edit-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadEditSheetComponent {

  public imageDescription: string = '';
  public selectedCategories: Array<{id: number, label: string}> = [];
  public selectedTags: Array<{id: number, label: string}> = [];

  public readonly editorConfig = {
    menubar: false,
    baseUrl: '/tinymce',
    suffix: '.min',
    height: 300,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
  };

  public readonly categories = [
    {id: 1, label: 'Artwork'},
    {id: 2, label: 'Battlemap'},
    {id: 3, label: 'Token'},
  ];

  public readonly tags$ = this.tagService.tags$.pipe(
    map(tags => tags.filter(t => t.id).map(t => ({id: t.id!, label: t.name})))
  );

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<UploadEditSheetComponent>,
    private readonly tagService: TagService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data?: UploadEditData
  ) {
    if (data) {
      this.selectedCategories = data.categories.map((c, idx) => ({id: idx, label: c}));
      this.selectedTags = data.tags.map((t, idx) => ({id: idx, label: t}));
      this.imageDescription = data.description;
    }
  }

  public close(): void {
    this._bottomSheetRef.dismiss(undefined);
  }

  public save(): void {
    const update: UploadEditData = {
      categories: this.selectedCategories.map(c => c.label),
      description: this.imageDescription,
      tags: this.selectedTags.map(t => t.label)
    };
    this._bottomSheetRef.dismiss(update);
  }

}
