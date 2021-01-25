import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../models/user';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private userId: string;
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.apiURL = settings.getApiURL;
    }

    get() {
        return this.http.get<User[]>(this.apiURL + '/users')
            .pipe(map(users => {
                return users;
            }));
    }

    getUserById(id) {
        return this.http.post<User>(this.apiURL + '/users/getById', { _id: id})
            .pipe(map(user => {
                return user;
            }));      
    }

    saveUser(user) {
        return this.http.post<User>(this.apiURL + '/users/update', user)
        .pipe(user => {
            return user;
        });  
    }

    setId(id) {
        this.userId = id;
    }

    getId() {
        return this.userId;
    }
}