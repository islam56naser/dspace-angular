import { Component, Input, OnInit } from '@angular/core';
import { ScriptDataService } from '../core/data/processes/script-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { getResponseFromEntry } from '../core/shared/operators';
import { DSOSuccessResponse } from '../core/cache/response.models';
import { AuthService } from '../core/auth/auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { EPerson } from '../core/eperson/models/eperson.model';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { hasValue, isEmpty, isNotEmpty } from '../shared/empty.util';
import { RemoteData } from '../core/data/remote-data';
import { Router } from '@angular/router';
import { ProcessDataService } from '../core/data/processes/process-data.service';
import { Process } from '../process-page/processes/process.model';
import { ConfigurationDataService } from '../core/data/configuration-data.service';
import { ConfigurationProperty } from '../core/shared/configuration-property.model';
import { Observable } from 'rxjs';
import { find } from 'rxjs/internal/operators/find';

export const CURATION_CFG = 'plugin.named.org.dspace.curate.CurationTask';

/**
 * Component responsible for rendering the Curation Task form
 */
@Component({
  selector: 'ds-curation-form',
  templateUrl: './curation-form.component.html'
})
export class CurationFormComponent implements OnInit {

  config: Observable<RemoteData<ConfigurationProperty>>;
  tasks: string[];
  form: FormGroup;

  @Input()
  dsoHandle: string;

  constructor(
    private scriptDataService: ScriptDataService,
    private configurationDataService: ConfigurationDataService,
    private processDataService: ProcessDataService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private translateService: TranslateService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      task: new FormControl(''),
      handle: new FormControl('')
    });

    this.config = this.configurationDataService.findByPropertyName(CURATION_CFG);
    this.config.pipe(
      find((rd: RemoteData<ConfigurationProperty>) => rd.hasSucceeded),
      map((rd: RemoteData<ConfigurationProperty>) => rd.payload)
    ).subscribe((configProperties) => {
      this.tasks = configProperties.values
        .filter((value) => isNotEmpty(value) && value.includes('='))
        .map((value) => value.split('=')[1].trim());
      this.form.get('task').patchValue(this.tasks[0]);
    });
  }

  /**
   * Determines whether the inputted dsoHandle has a value
   */
  hasHandleValue() {
    if (hasValue(this.dsoHandle)) {
      return true;
    }
    return false;
  }

  /**
   * Submit the selected taskName and handle to the script data service to run the corresponding curation script
   * Navigate to the process page on success
   */
  submit() {
    const taskName = this.form.get('task').value;
    let handle;
    if (this.hasHandleValue()) {
      handle = this.dsoHandle;
    } else {
      handle = this.form.get('handle').value;
      if (isEmpty(handle)) {
        handle = 'all';
      }
    }
    this.authService.getAuthenticatedUserFromStore().pipe(
      take(1),
      switchMap((eperson: EPerson) => {
        return this.scriptDataService.invoke('curate', [
          {name: '-t', value: taskName},
          {name: '-i', value: handle},
          {name: '-e', value: eperson.email},
        ], []).pipe(getResponseFromEntry());
      })
    ).subscribe((response: DSOSuccessResponse) => {
      if (response.isSuccessful) {
        this.notificationsService.success(this.translateService.get('curation.form.submit.success.head'),
          this.translateService.get('curation.form.submit.success.content'));
        this.processDataService.findByHref(response.resourceSelfLinks[0]).pipe(
          filter((processRD: RemoteData<Process>) => hasValue(processRD) && hasValue(processRD.payload)),
          take(1))
          .subscribe((processRD: RemoteData<Process>) => {
            this.router.navigate(['/processes', processRD.payload.processId]);
          });
      } else {
        this.notificationsService.error(this.translateService.get('curation.form.submit.error.head'),
          this.translateService.get('curation.form.submit.error.content'));
      }
    });
  }
}
