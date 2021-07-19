import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService
{
    //private apiURL = 'http://localhost:3000'
    private apiURL = 'https://tonny.my.to:3001'

    public get getApiURL() {
        return this.apiURL;
    }
}