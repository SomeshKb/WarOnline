import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrainUnitsComponent } from '../train-units/train-units.component';
import { TileData } from '../../utility/interfaces';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
})
export class BaseComponent {
  baseImage = 'assets/base/military.png';
  units = [1, 2, 3, 4, 5, 6];
  isBaseOwner = true;

  trainUnit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tile : TileData , baseIndex : number}, private dialog : MatDialog) {
  }

  toggleTrainPanel() {
    this.trainUnit = !this.trainUnit;
  }

  closeDialog(){
    this.dialog.closeAll();
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  openArmy(){
    const armyPanel = this.dialog.open(TrainUnitsComponent, {panelClass : "train-base-wrapper"});

    armyPanel.afterClosed().subscribe(()=>{
      console.log("Army Panel closed")
    });
  }
}
