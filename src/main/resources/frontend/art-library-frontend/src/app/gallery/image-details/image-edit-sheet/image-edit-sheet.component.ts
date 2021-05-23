import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {TagService} from "../../../services/tag.service";
import {map} from "rxjs/operators";
import {ImageGalleryData, ImageMetadataUpdate} from "../../../models/image.model";

@Component({
  selector: 'app-image-edit-sheet',
  templateUrl: './image-edit-sheet.component.html',
  styleUrls: ['./image-edit-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageEditSheetComponent {

  private imageId?: number;
  public imageTitle: string = '';
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
    private _bottomSheetRef: MatBottomSheetRef<ImageEditSheetComponent>,
    private readonly tagService: TagService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {activeImage: ImageGalleryData | undefined}
  ) {
    if (data.activeImage) {
      this.imageId = data.activeImage.id;
      this.imageTitle = data.activeImage.title ?? '';
      this.imageDescription = data.activeImage.description ?? '';
      this.selectedCategories = data.activeImage.category ? [{id: 1, label: data.activeImage.category}] : [];
      this.selectedTags = data.activeImage.tags.filter(t => t.id).map(t => ({id: t.id!, label: t.name}));
    }
  }

  public close(): void {
    this._bottomSheetRef.dismiss(undefined);
  }

  public save(): void {
    if (this.imageId == null) {
      return;
    }
    const update: ImageMetadataUpdate = {
      id: this.imageId,
      title: this.imageTitle,
      category: this.selectedCategories[0]?.label,
      description: this.imageDescription,
      tags: this.selectedTags.map(t => t.label)
    };
    this._bottomSheetRef.dismiss(update);
  }
}
