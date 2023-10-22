import { Component, OnDestroy } from '@angular/core';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css']
})
export class BotComponent implements OnDestroy {

  selectedCount: number = 0;
  private selectedCountSubscription: Subscription;

  constructor(private sharedService: SharedService) {
    this.selectedCountSubscription = this.sharedService.selectedCount$.subscribe(
      (count) => {
        this.selectedCount = count;
      }
    );
  }

  ngOnDestroy() {
    this.selectedCountSubscription.unsubscribe();
  }

}
