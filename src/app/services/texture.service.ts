import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Color, TextureLoader } from 'three';
import { TextureAtlas } from '../models/TextureAtlas';

@Injectable({
  providedIn: 'root',
})
export class TextureService {
  public texture;

  constructor(private http: HttpClient) {}

  public loadTextureAtlas(): Observable<any> {
    return this.http.get('assets/materials/land-atlas.json');
  }

  loadTexture() {
    const textureLoader = new TextureLoader();
    const loadTexture = (name: string) => {
      const texture = textureLoader.load(name);
      texture.name = name;
      return texture;
    };
    const options = {
      terrainAtlas: null,
      landTexture: loadTexture('assets/materials/land.png'),
      terrainAtlasTexture: loadTexture('assets/materials/terrain.png'),
      hillsNormalTexture: loadTexture('assets/materials/hills-normal.png'),
      coastAtlasTexture: loadTexture('assets/materials/coast-diffuse.png'),
      riverAtlasTexture: loadTexture('assets/materials/river-diffuse.png'),
      undiscoveredTexture: loadTexture('assets/materials/paper.jpg'),
      treeSpritesheet: loadTexture('assets/materials/trees.png'),
      treeSpritesheetSubdivisions: 4,
      transitionTexture: loadTexture('assets/materials/transitions.png'),
      treesPerForest: 50,
      gridWidth: 0.025,
      gridColor: new Color(0x42322b),
      gridOpacity: 0.25,

      // options per tree index, varying the different kinds of trees a little
      treeOptions: [
        undefined, // leave default options for trees with index 0 (temperate zone forests)
        {
          // tundra trees
          treesPerForest: 25,
        },
        {
          // snowy trees
          treesPerForest: 10,
          scale: 0.85,
        }, // no options for tropical forests (index = 3)
      ],
    };

    return options;
  }
}
