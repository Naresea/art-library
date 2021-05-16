import {Component} from '@angular/core';
import {ImageService} from "../services/image.service";
import {ReplaySubject} from "rxjs";
import {ImageMetadata, ImageMetadataUpdate} from "../models/image.model";
import {TagService} from "../services/tag.service";
import {ImageSearch} from "./image-sidebar/image-sidebar.component";

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent {

  public readonly selectedImage$$ = new ReplaySubject<ImageMetadata | undefined>(1);
  public readonly imagePage$ = this.imageService.imagePage$;
  public readonly tags$ = this.tagService.tags$;

  constructor(private readonly imageService: ImageService, private readonly tagService: TagService) { }


  public getPage(pageIdx: number): void {
    this.imageService.getPage(pageIdx);
  }

  public updateImage(image: ImageMetadataUpdate): void {
    this.imageService.updateImage(image);
  }

  public deleteImage(id: number): void {
    this.imageService.deleteImage(id);
  }

  public search(evt: ImageSearch): void {
    this.imageService.search(evt.operation, evt.tags, evt.categories);
  }
}
