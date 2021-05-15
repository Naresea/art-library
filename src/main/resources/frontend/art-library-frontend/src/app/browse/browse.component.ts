import { Component, OnInit } from '@angular/core';
import {ImageService} from "../services/image.service";

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  public readonly images$ = this.imageService.images$;

  constructor(private readonly imageService: ImageService) { }

  ngOnInit(): void {
  }

}
