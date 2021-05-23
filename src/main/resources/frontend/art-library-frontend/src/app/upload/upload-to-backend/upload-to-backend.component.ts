import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-upload-to-backend',
  templateUrl: './upload-to-backend.component.html',
  styleUrls: ['./upload-to-backend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadToBackendComponent {

  @Input()
  public progress?: number | null = 0;

  @Input()
  public step?: string | null = '';

}
