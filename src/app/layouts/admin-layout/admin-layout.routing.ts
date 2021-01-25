import { Routes } from '@angular/router';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { UsermgmtComponent } from '../../pages/usermgmt/usermgmt.component';
import { WeightComponent } from 'app/pages/weight/weight.component';
import { StravaComponent } from 'app/pages/strava/strava.component';
import { CalendarComponent } from 'app/pages/calendar/calendar.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'weight',         component: WeightComponent },
    { path: 'strava',         component: StravaComponent },
    { path: 'calendar',       component: CalendarComponent },
    { path: 'usermgmt',       component: UsermgmtComponent },
    { path: 'user',           component: UserComponent }
];
