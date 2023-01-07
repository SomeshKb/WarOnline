import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HexGeneratorService } from 'src/app/services/hex-generator.service';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-distict',
  templateUrl: './distict.component.html',
  styleUrls: ['./distict.component.css']
})
export class DistictComponent implements OnInit {
  tileID = null;
  title = 'World';
  noOfRow = 10;
  noOfCol = 10

  gridArray = [3, 4, 5, 6, 7, 6, 5, 4, 3]
  largestRow = 7;
  ownArmy = "self";
  armies = [1, 2, 3, 4, 5, 6];

  selectedArmy = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tileID: string }, private hexGenerator: HexGeneratorService, public dialog: MatDialog) {
    this.tileID = data.tileID;
    console.log(this.tileID)
  }


  ngOnInit(): void {
  }

  onClick(i: number, j: number) {

    console.log(i,j);
    this.dialog.closeAll();
    this.dialog.open(BaseComponent, { data: { x: i, y: j } })
  }
  getStartingMargin(value: number, midRowValue: number) {
    return ((midRowValue - value) * 33);
  }

  onArmySelection(index){
      const selected = this.armies[index];
      // TODO : GET selectedArmy
      this.selectedArmy = [{ unit: "A1", count: 345 }, { unit: "A3", count: 89 }, { unit: "A2", count: 69 }];
  }

}

