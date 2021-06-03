import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

export const KNOWN_ROUTES = {
  upload: '/upload',
  gallery: '/gallery'
};

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: KNOWN_ROUTES.gallery},
  { path: 'upload', loadChildren: () => import('./upload/upload.module').then(m => m.UploadModule) },
  { path: 'gallery', loadChildren: () => import('./gallery/gallery.module').then(m => m.GalleryModule) }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        useHash: true
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
