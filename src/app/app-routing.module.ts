import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsiaComponent } from './component/map/asia/asia.component';

const routes: Routes = [
  { path: "", redirectTo: "asia", pathMatch: "full" },
  { path: "asia", component: AsiaComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
