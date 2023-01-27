import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-train-units',
  templateUrl: './train-units.component.html',
  styleUrls: ['./train-units.component.css'],
})
export class TrainUnitsComponent {
  unitsType = [
    'Tank',
    'Anti_Infantry',
    'SAM',
    'Fighter',
    'Bomber',
    'Apache',
    'Spy_Plane',
    'Battleship',
    'Hovercraft',
    'Submarine',
    'Aircraft_Carrier',
    'Destroyer',
  ];
  constructor() {}
}
