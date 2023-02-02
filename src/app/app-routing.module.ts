import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './component/map/map.component';
import { Continent } from './models/continents';

const routes: Routes = [
  {
    path: 'africa',
    component: MapComponent,
    data: { continent: Continent.Africa },
  },
  {
    path: 'south-america',
    component: MapComponent,
    data: { continent: Continent.SouthAmerica },
  },
  {
    path: 'australia',
    component: MapComponent,
    data: { continent: Continent.Australia },
  },
  {
    path: 'north-america',
    component: MapComponent,
    data: { continent: Continent.NorthAmerica },
  },
  {
    path: 'europe',
    component: MapComponent,
    data: { continent: Continent.Europe },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
