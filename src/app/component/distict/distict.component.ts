import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  selector: 'app-distict',
  templateUrl: './distict.component.html',
  styleUrls: ['./distict.component.css']
})
export class DistictComponent implements OnInit {
  tileID = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {tileID: string}) {
    this.tileID = data.tileID;
  }

  ngOnInit(): void {
  }
}
