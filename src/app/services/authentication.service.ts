﻿import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user';
import { SettingsService } from './settings.service'

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        globalThis.ftp = this.currentUserValue.ftp;
        globalThis.weight = this.currentUserValue.weight;
        this.apiURL = this.settings.getApiURL;
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email, password) {
        return this.http.post<any>(this.apiURL + '/auth', { email, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                globalThis.ftp = user.ftp;
                globalThis.weight = user.weight;
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}