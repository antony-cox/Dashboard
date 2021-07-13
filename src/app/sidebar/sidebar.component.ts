import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { AuthenticationService } from 'app/services/authentication.service';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    permission: string;
}

export const ROUTES: RouteInfo[] = [
    // { path: '/dashboard',     title: 'Dashboard',         icon:'fas fa-home',           class: '',  permission: '' },
    { path: '/weight',        title: 'WeightTracker',     icon:'fas fa-weight',         class: '',  permission: 'WEIGHT' },
    { path: '/strava',        title: 'Strava',            icon:'fab fa-strava',         class: '',  permission: 'STRAVA' },
    { path: '/calendar',      title: 'Calendar',          icon:'far fa-calendar',       class: '',  permission: 'CALENDAR' },
    { path: '/workout',       title: 'Workouts',          icon:'fas fa-dumbbell',          class: '',  permission: 'WORKOUT' },
    { path: '/user',          title: 'User Profile',      icon:'fas fa-user',           class: '',  permission: 'SUPERADMIN' },
    { path: '/usermgmt',      title: 'User Management',   icon:'fas fa-users',          class: '',  permission: 'SUPERADMIN' },
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    public user: User;

    constructor(private authService: AuthenticationService) {
        this.user = authService.currentUserValue;
      }

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => this.user.permissions.includes(menuItem.permission) || menuItem.permission === '');
    }
}
