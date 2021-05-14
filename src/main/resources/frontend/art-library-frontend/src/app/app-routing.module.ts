import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/asset-upload'},
  { path: 'asset-upload', loadChildren: () => import('./asset-upload/asset-upload.module').then(m => m.AssetUploadModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
