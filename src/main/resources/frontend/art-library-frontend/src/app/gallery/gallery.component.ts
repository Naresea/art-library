import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ImageGalleryData, ImageMetadataUpdate} from "../models/image.model";
import {ImageService} from "../services/image.service";


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {

  public readonly selectedImage$$ = new BehaviorSubject<ImageGalleryData | undefined>(undefined);

  constructor(private readonly imageService: ImageService) {}

  public updateImage(event: ImageMetadataUpdate): void {
    this.imageService.updateImage(event);
  }
}
