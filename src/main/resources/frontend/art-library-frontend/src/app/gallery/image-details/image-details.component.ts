import {ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ImageGalleryData, ImageMetadataUpdate, ImageSize} from "../../models/image.model";
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {ImageEditSheetComponent} from "./image-edit-sheet/image-edit-sheet.component";
import {ImageService} from "../../services/image.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDetailsComponent implements OnDestroy {

  private readonly destroy$$ = new Subject<void>();

  @Input()
  public image?: ImageGalleryData;

  @Output()
  public close = new EventEmitter<void>();

  @Output()
  public imageUpdate = new EventEmitter<ImageMetadataUpdate>();

  private sheet?: MatBottomSheetRef<unknown, unknown>;

  constructor(private readonly matBottomSheet: MatBottomSheet) {}

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public openEditSheet(): void {
    this.sheet = this.matBottomSheet.open(ImageEditSheetComponent, {
      data: { activeImage: this.image }
    });
    this.sheet.afterDismissed().pipe(
      takeUntil(this.destroy$$)
    ).subscribe((result) => {
      console.log('Received update: ', result);
      if (result != null) {
        this.imageUpdate.emit(result as ImageMetadataUpdate);
      }
    });
  }

  public downloadImage(): void {
    if (!this.image) {
      return;
    }
    const url = ImageService.getImageUrl(this.image, ImageSize.ORIGINAL);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.image.title + '.webp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public closeScreen() {
    this.close.emit();
  }
}
