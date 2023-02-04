import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { LeftNavComponent } from './component/left-nav/left-nav.component';
import { ChatWindowComponent } from './component/chat-window/chat-window.component';
import { DistictComponent } from './component/distict/distict.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { BaseComponent } from './component/base/base.component';
import { TrainUnitsComponent } from './component/train-units/train-units.component';
import { MapComponent } from './component/map/map.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export let AppInjector: Injector;

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LeftNavComponent,
    ChatWindowComponent,
    DistictComponent,
    BaseComponent,
    TrainUnitsComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    HttpClientModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
