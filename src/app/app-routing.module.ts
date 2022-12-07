import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsiaComponent } from './component/map/asia/asia.component';
import { AustraliaComponent } from './component/map/australia/australia.component';

const routes: Routes = [
  { path: "", redirectTo: "australia", pathMatch: "full" },
  { path: "asia", component: AsiaComponent },
  { path: "australia", component: AustraliaComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
