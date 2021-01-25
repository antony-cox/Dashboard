import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
;
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.apiURL = settings.getApiURL;
    }

    get() {
        return this.http.get<any>(this.apiURL + '/leaderboard')
            .pipe(map(config => {
                return config;
            }));
    }

    refresh() {
        return this.http.post<any>(this.apiURL + '/leaderboard/refresh', null)
        .pipe(map(data => {
            return data;
        }));
    }
}