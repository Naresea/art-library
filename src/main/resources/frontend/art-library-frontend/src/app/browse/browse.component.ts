import {Component} from '@angular/core';
import {ImageService} from "../services/image.service";

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent {

  public readonly images$ = this.imageService.images$;
  public readonly imagePage$ = this.imageService.imagePage$;

  constructor(private readonly imageService: ImageService) { }


  public getPage(pageIdx: number): void {
    this.imageService.getPage(pageIdx);
  }
}
