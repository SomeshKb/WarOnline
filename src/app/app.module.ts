import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AsiaComponent } from './component/map/asia/asia.component';
import { AustraliaComponent } from './component/map/australia/australia.component';
import { HeaderComponent } from './component/header/header.component';
import { LeftNavComponent } from './component/left-nav/left-nav.component';
import { ChatWindowComponent } from './component/chat-window/chat-window.component';
import { DistictComponent } from './component/distict/distict.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AsiaComponent,
    AustraliaComponent,
    HeaderComponent,
    LeftNavComponent,
    ChatWindowComponent,
    DistictComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
