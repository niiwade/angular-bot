import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BotComponent } from './bot/bot.component';
import { SharedService } from './shared.service';

@NgModule({
  declarations: [
    AppComponent,
    BotComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
