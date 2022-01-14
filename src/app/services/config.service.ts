import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
;
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.apiURL = settings.getApiURL;
    }

    get() {
        return this.http.get<any>(this.apiURL + '/config')
            .pipe(map(config => {
                return config;
            }));
    }

    getLeaderboardDate() {
        return this.http.get<any>(this.apiURL + '/config/getLeaderboardDate')
            .pipe(map(config => {
                return config;
            }));
    }

    add(config) {
        return this.http.post<any>(this.apiURL + '/config/add', { config })
        .pipe(map(data => {
            return data;
        }));
    }
}