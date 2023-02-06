import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TileData } from './../../utility/interfaces';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-distict',
  templateUrl: './distict.component.html',
  styleUrls: ['./distict.component.css'],
})
export class DistictComponent {
  tile = null;
  title = 'World';
  noOfBase = 49;
  ownArmy = 'self';
  armies = [1, 2, 3, 4, 5, 61, 2, 3, 4, 5, 6,1, 2, 3, 4, 5, 61, 2, 3, 4, 5, 6,1, 2,1];

  selectedArmy = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TileData,
    public dialog: MatDialog
  ) {
    this.tile = data;
    console.log(this.tile);
  }

  onClick(i: number, j: number) {
    console.log(i, j);
    this.dialog.closeAll();
    this.dialog.open(BaseComponent, { data: { x: i, y: j } });
  }
  getStartingMargin(value: number, midRowValue: number) {
    return (midRowValue - value) * 33;
  }

  onArmySelection(index) {
    const selected = this.armies[index];
    // TODO : GET selectedArmy
    this.selectedArmy = [
      { unit: 'A1', count: 345 },
      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },     { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },     { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },      { unit: 'A3', count: 89 },
      { unit: 'A2', count: 69 },
    ];
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
}
