import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetUploadComponent } from './asset-upload.component';

const routes: Routes = [
  { path: '', component: AssetUploadComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetUploadRoutingModule { }
