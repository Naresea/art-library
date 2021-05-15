import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {KNOWN_ROUTES} from "./app-routing.module";
import {ImageService} from "./services/image.service";
import {ReplaySubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {QueryMethod} from "./models/image.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('searchbar', {read: ElementRef})
  public searchBar?: ElementRef;

  public readonly routes = KNOWN_ROUTES;

  private readonly searchTerm$$ = new ReplaySubject<string>(1);
  private searchTerm$ = this.searchTerm$$.pipe(
    debounceTime(500)
  );

  public get isInBrowse() {
    return this.router.url.startsWith(this.routes.browse);
  }

  public search(): void {
    if (this.searchBar && this.searchBar.nativeElement) {
      const text = (this.searchBar.nativeElement as HTMLInputElement).value;
      this.searchTerm$$.next(text);
    }
  }

  constructor(private readonly router: Router, private readonly imageService: ImageService) {
    this.searchTerm$.subscribe((search) => this.imageService.search(QueryMethod.HAS_ALL_OF, search))
  }
}
