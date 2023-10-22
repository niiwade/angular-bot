import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private selectedCountSubject = new BehaviorSubject<number>(0);
  selectedCount$ = this.selectedCountSubject.asObservable();

  setSelectedCount(count: number) {
    this.selectedCountSubject.next(count);
  }
}
