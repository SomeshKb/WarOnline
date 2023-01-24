import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
})
export class BaseComponent implements OnInit {
  baseImage = 'assets/base/military.png';
  units = [1, 2, 3, 4, 5, 6];
  isBaseOwner = true;

  trainUnit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { x: string; y: string }) {
    console.log('BASE', data);
  }

  ngOnInit(): void {}

  toggleTrainPanel() {
    this.trainUnit = !this.trainUnit;
  }
}
