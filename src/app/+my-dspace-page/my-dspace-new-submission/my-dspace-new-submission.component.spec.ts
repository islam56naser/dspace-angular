import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Store } from '@ngrx/store';
import { of as observableOf } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { AuthServiceStub } from '../../shared/testing/auth-service.stub';
import { AuthService } from '../../core/auth/auth.service';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { createTestComponent } from '../../shared/testing/utils.test';
import { MyDSpaceNewSubmissionComponent } from './my-dspace-new-submission.component';
import { AppState } from '../../app.reducer';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { SharedModule } from '../../shared/shared.module';
import { getMockScrollToService } from '../../shared/mocks/scroll-to-service.mock';
import { UploaderService } from '../../shared/uploader/uploader.service';
import { By } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploaderComponent } from 'src/app/shared/uploader/uploader.component';

describe('MyDSpaceNewSubmissionComponent test', () => {

  const translateService: TranslateService = jasmine.createSpyObj('translateService', {
    get: (key: string): any => { observableOf(key) },
    instant: jasmine.createSpy('instant')
  });

  const uploader: any = jasmine.createSpyObj('uploader', {
    clearQueue: jasmine.createSpy('clearQueue')
  });

  const modalService = {
    open: () => {
      return { result: new Promise((res, rej) => {/****/}) };
    }
  };

  const store: Store<AppState> = jasmine.createSpyObj('store', {
    /* tslint:disable:no-empty */
    dispatch: {},
    /* tslint:enable:no-empty */
    pipe: observableOf(true)
  });
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [
        MyDSpaceNewSubmissionComponent,
        TestComponent
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: HALEndpointService, useValue: new HALEndpointServiceStub('workspaceitems') },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: ScrollToService, useValue: getMockScrollToService() },
        { provide: Store, useValue: store },
        { provide: TranslateService, useValue: translateService },
        { provide: NgbModal, useValue: modalService },
        ChangeDetectorRef,
        MyDSpaceNewSubmissionComponent,
        UploaderService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-my-dspace-new-submission (uploadEnd)="reload($event)"></ds-my-dspace-new-submission>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create MyDSpaceNewSubmissionComponent', inject([MyDSpaceNewSubmissionComponent], (app: MyDSpaceNewSubmissionComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    let fixture: ComponentFixture<MyDSpaceNewSubmissionComponent>;
    let comp: MyDSpaceNewSubmissionComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(MyDSpaceNewSubmissionComponent);
      comp = fixture.componentInstance;
      comp.uploadFilesOptions.authToken = 'user-auth-token';
      comp.uploadFilesOptions.url = 'https://fake.upload-api.url';
      comp.uploaderComponent = TestBed.createComponent(UploaderComponent).componentInstance;
      comp.uploaderComponent.uploader = uploader;
    });

    it('should call app.openDialog', () => {
      spyOn(comp, 'openDialog');
      const submissionButton = fixture.debugElement.query(By.css('button.btn-primary'));
      submissionButton.triggerEventHandler('click', {
        preventDefault: () => {/**/
        }
      });
      expect(comp.openDialog).toHaveBeenCalled();
    });

    it('should show a collection selector if only one file are uploaded', () => {
      spyOn((comp as any).modalService, 'open').and.returnValue({ result: new Promise((res, rej) => {/****/}) });
      comp.afterFileLoaded(['']);
      expect((comp as any).modalService.open).toHaveBeenCalled();
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

  reload = (event) => {
    return;
  }
}
