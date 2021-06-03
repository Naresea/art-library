import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ImageService} from "./services/image.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  public searchVisible$$ = new BehaviorSubject<boolean>(false);

  public toggleSearch(): void {
    const current = this.searchVisible$$.getValue();
    this.searchVisible$$.next(!current);
  }

  constructor(private readonly imageService: ImageService) {}

  public ngOnInit(): void {
    this.imageService.searchLucene('');
  }

  public searchFor(search: string): void {
    this.imageService.searchLucene(search);
  }
}
