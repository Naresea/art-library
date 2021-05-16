import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ImageCategory,
  ImageMetadata,
  ImageMetadataUpdate,
  ImageSize,
  ImageTagMetadata,
  QueryMethod
} from "../../models/image.model";
import {IDropdownSettings} from "ng-multiselect-dropdown";
import {ImageService} from "../../services/image.service";

export interface ImageSearch {
  tags: Array<string>;
  categories: Array<string>;
  operation: QueryMethod;
}

@Component({
  selector: 'app-image-sidebar',
  templateUrl: './image-sidebar.component.html',
  styleUrls: ['./image-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSidebarComponent {

  public readonly QUERY_METHOD = QueryMethod;
  public readonly CATEGORIES = ImageCategory;

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
  private mEditorContent?: string;

  public readonly multiselectSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  public get editorContent(): string {
    if (this.mEditorContent) {
      return this.mEditorContent;
    }
    if (this.activeImage) {
      return this.activeImage.description ?? '';
    }
    return '';
  }
  public set editorContent(content: string) {
    this.mEditorContent = content;
  }

  @Input()
  public activeImage?: ImageMetadata | null;

  @Input()
  public knownTags?: Array<ImageTagMetadata> = [];

  @Output()
  public updateImage = new EventEmitter<ImageMetadataUpdate>();

  @Output()
  public deleteImage = new EventEmitter<number>();

  @Output()
  public searchTriggered = new EventEmitter<ImageSearch>();

  public selectedTags: Array<{item_id: number | undefined, item_text: string}> = [];

  public selectedCategories: Array<{item_id: number | undefined, item_text: string}> = [];

  public get searchCategories() {
    return [
      { item_id: 0, item_text: ImageCategory.TOKEN },
      { item_id: 1, item_text: ImageCategory.BATTLEMAP },
      { item_id: 2, item_text: ImageCategory.ARTWORK },
    ]
  }

  public get searchTags() {
    return (this.knownTags ?? []).map(t => ({
      item_id: t.id,
      item_text: t.name
    }));
  }

  public getImageTags(image: ImageMetadata): string {
    return image.tags.map(t => t.name).sort().join(', ');
  }

  public updateImageImpl(image: ImageMetadata, category: string, tags: string, title: string): void {
    const parsedTags = tags.split(',').map(t => t.trim());
    const content = this.editorContent.trim();
    const description = content === image.description
      ? undefined
      : content;

    const update: ImageMetadataUpdate = {
      id: image.id,
      category,
      title,
      tags: parsedTags,
      description
    }

    image.tags = parsedTags.map(t => ({id: undefined, name: t}));
    image.category = category;
    if (description) {
      image.description = description;
    }
    this.updateImage.emit(update);
  }

  public deleteImageImpl(image: ImageMetadata): void {
    this.deleteImage.emit(image.id);
  }

  public search(query: string): void {
    const tags = this.selectedTags.map(t => t.item_text);
    const categories = this.selectedCategories.map(t => t.item_text);
    this.searchTriggered.emit({
      tags,
      categories,
      operation: query as QueryMethod
    });
  }

  public downloadImage(activeImage: ImageMetadata): void {
    const url = ImageService.getImageUrl(activeImage, ImageSize.ORIGINAL);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeImage.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
