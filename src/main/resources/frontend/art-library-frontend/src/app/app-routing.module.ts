import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

export const KNOWN_ROUTES = {
  browse: '/browse',
  upload: '/asset-upload'
};

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: KNOWN_ROUTES.browse},
  { path: 'asset-upload', loadChildren: () => import('./asset-upload/asset-upload.module').then(m => m.AssetUploadModule) },
  { path: 'browse', loadChildren: () => import('./browse/browse.module').then(m => m.BrowseModule) }
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
