import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './helpers/auth.guard';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';

export const AppRoutes: Routes = [
  { path: '', redirectTo: 'workout', pathMatch: 'full', canActivate: [AuthGuard]}, 
  { path: '', component: AdminLayoutComponent, children: [{path: '', loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'}], canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: 'workout'}
]
