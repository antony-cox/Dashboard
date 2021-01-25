import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Weight } from '../models/weight';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class WeightService {
    private apiURL;

    constructor(private http: HttpClient, private settings: SettingsService) {
        this.apiURL = settings.getApiURL;
    }

    get() {
        return this.http.get<Weight[]>(this.apiURL + '/weight')
            .pipe(map(weights => {
                return weights;
            }));
    }

    add(weight) {
        return this.http.post<any>(this.apiURL + '/weight/add', { weight })
        .pipe(map(data => {
            return data;
        }));
    }
}