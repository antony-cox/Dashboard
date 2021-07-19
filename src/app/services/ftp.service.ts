import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FtpService {

  private ftp = new BehaviorSubject(localStorage.getItem('ftp'));
  currentFtp = this.ftp.asObservable();

  constructor() {
    if(this.ftp.value == null) { this.setFtp('100'); }
   }

  setFtp(ftp: string) {
    this.ftp.next(ftp)
  }
}