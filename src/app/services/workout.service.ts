import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Workout } from '../models/workout';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.apiURL = settings.getApiURL;
    }

    get(page, name, category) {
        return this.http.post<Workout[]>(this.apiURL + '/workouts', { page: page, limit: 20, name: name, category: category })
            .pipe(map(workout => {
                return workout;
            }));
    }

    getDetail(id) {
        return this.http.post<Workout>(this.apiURL + '/workouts/detail', { id: id })
            .pipe(map(workout => {
                return workout;
            }));
    }

    sendToIntervals(param) {
        return this.http.post<any>(this.apiURL + '/workouts/sendToIntervals', param)
            .pipe(map(result => {
                return result;
            }));
    }
}