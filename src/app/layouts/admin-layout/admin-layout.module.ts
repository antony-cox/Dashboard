import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { DashboardComponent }       from '../../pages/dashboard/dashboard.component';
import { UserComponent }            from '../../pages/user/user.component';
import { TableComponent }           from '../../pages/table/table.component';
import { UsermgmtComponent }           from '../../pages/usermgmt/usermgmt.component';
import { TypographyComponent }      from '../../pages/typography/typography.component';
import { IconsComponent }           from '../../pages/icons/icons.component';
import { NotificationsComponent }   from '../../pages/notifications/notifications.component';

import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WeightComponent } from 'app/pages/weight/weight.component';
import { StravaComponent } from 'app/pages/strava/strava.component';
import { CalendarComponent } from 'app/pages/calendar/calendar.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { WorkoutComponent } from 'app/pages/workout/workout.component';
import { WorkoutDetailComponent } from 'app/pages/workoutDetail/workoutDetail.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { NgxSliderModule } from '@angular-slider/ngx-slider';


@NgModule({
  imports: [
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    NgbModalModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    ClipboardModule,
    MatDatepickerModule,
    NgxSliderModule
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    TableComponent,
    TypographyComponent,
    IconsComponent,
    NotificationsComponent,
    UsermgmtComponent,
    WeightComponent,
    StravaComponent,
    CalendarComponent,
    WorkoutComponent,
    WorkoutDetailComponent,
  ]
})

export class AdminLayoutModule {}
