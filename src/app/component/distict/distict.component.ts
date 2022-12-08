import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-distict',
  templateUrl: './distict.component.html',
  styleUrls: ['./distict.component.css']
})
export class DistictComponent implements OnInit, OnChanges {

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }

}
