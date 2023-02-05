import { Continent } from "../models/continents";
import { BufferGeometry, Line, LineBasicMaterial, Scene } from "three";
import southAmerica from 'src/assets/map-data/south-america-boundary.json';
import northAmerica from 'src/assets/map-data/north-america-boundary.json';
import africa from 'src/assets/map-data/africa-boundary.json';
import australia from 'src/assets/map-data/australia-boundary.json';
import europe from 'src/assets/map-data/europe-boundary.json';
import asia from 'src/assets/map-data/asia-boundary.json';
export class ContinentBoundaryCreater {

    private _scene: Scene;

    constructor(scene) {
        this._scene = scene;
    }

    drawLine(continent: Continent, colorCode = "white") {
        const sides = this.getContinentBoundaryData(continent);
        sides.map(x => {
            const geometry = new BufferGeometry().setFromPoints(x);
            const material = new LineBasicMaterial({ color: colorCode, fog: true, linewidth: 5 });
            const line = new Line(geometry, material);
            this._scene.add(line)
        });
    }

    getContinentBoundaryData(continent: Continent) {
        switch (continent) {
          case Continent.Africa:
            return africa;
          case Continent.Asia:
            return asia;
          case Continent.Europe:
            return europe;
          case Continent.NorthAmerica:
            return northAmerica;
          case Continent.Australia:
            return australia;
          case Continent.SouthAmerica:
            return southAmerica;
          default:
            return [];
        }
      }
}