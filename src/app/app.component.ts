import { Component } from '@angular/core';
import { BufferGeometry, LineBasicMaterial, Line } from 'three';
import { TestService } from '../app/test.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  selectedSides = []
  _scene
  selectedIndex = [false, false, false, false, false, false]
  sides = [];
  constructor(private test: TestService) {
    this.test.hexInfo.subscribe((x: any[]) => {
      this.sides = x;
    });

    this.test.scene.subscribe((x: any) => {
      this._scene = x;
      this.drawLine(this.selectedSides);
    });
  }

  selected(index) {
    this.selectedIndex[index] = !this.selectedIndex[index];
    console.log(this.selectedIndex)
  }

  selection() {
    this.selectedIndex.map((x, index) => {
      if (x == true) {
        this.selectedSides.push(this.sides[index])
      }
    });

    console.log(this.selectedSides)
    this.drawLine(this.selectedSides)
    this.sides = [];
    this.selectedIndex = [false, false, false, false, false, false]

  }

  showPoints() {
    console.log(this.selectedSides);
  }

  drawLine(sides) {
    sides.map(x => {
      const geometry = new BufferGeometry().setFromPoints(x);
      const material = new LineBasicMaterial({ color: 0xff0000, fog: true, linewidth: 5 });
      const line = new Line(geometry, material);
      this._scene.add(line)
    });
  }
}
