import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Color, TextureLoader } from 'three';
import { LAND_VERTEX_SHADER } from 'src/assets/shaders/land.vertex';
import { LAND_FRAGMENT_SHADER } from 'src/assets/shaders/land.fragment';
import { MapGenerator } from 'src/app/utility/generateRandomMap';
import { MOUNTAINS_FRAGMENT_SHADER } from 'src/app/shaders/mountains.fragment';
import { MOUNTAINS_VERTEX_SHADER } from 'src/app/shaders/mountains.vertex';
import { MapMeshOptions } from 'src/app/utility/MapMesh';
import MapView from 'src/app/utility/MapView';
import { initInput } from 'src/app/utility/input';
import Controller from 'src/app/utility/DefaultMapViewController';
import { TileData } from 'src/app/utility/interfaces';
import { ActivatedRoute } from '@angular/router';
import { Continent } from 'src/app/models/continents';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('canvas') canvasRef: ElementRef;
  @ViewChild('text') textRef: ElementRef;
  @ViewChild('debug') debugRef: ElementRef;

  constructor(private route : ActivatedRoute) {
    
   }

  async ngOnInit(): Promise<void> {
    const mapSize = 48;
    const continent = this.route.snapshot.data['continent'];
    const mapGenerator = new MapGenerator(mapSize);
    const map = await mapGenerator.generate(continent as Continent);

    const assetsList = [
      'assets/materials/terrain.png',
      'assets/materials/hills-normal.png',
      'assets/materials/coast-diffuse.png',
      'assets/materials/river-diffuse.png',
      'assets/materials/paper.jpg',
      'assets/materials/trees.png',
      'assets/materials/transitions.png',
    ];
    const response = await fetch('assets/materials/land-atlas.json');
    const terrainAtlas = await response.json();
    const promiseArr = assetsList.map((asset) =>
      new TextureLoader().loadAsync(asset)
    );
    const [
      terrainAtlasTexture,
      hillsNormalTexture,
      coastAtlasTexture,
      riverAtlasTexture,
      undiscoveredTexture,
      treeSpritesheet,
      transitionTexture,
    ] = await Promise.all(promiseArr);

    riverAtlasTexture;

    const options: MapMeshOptions = {
      terrainAtlas,
      terrainAtlasTexture,
      hillsNormalTexture,
      coastAtlasTexture,
      riverAtlasTexture,
      undiscoveredTexture,
      treeSpritesheet,
      treeSpritesheetSubdivisions: 4,
      transitionTexture,
      treesPerForest: 1,
      gridWidth: 0.025,
      gridColor: new Color(0x42322b),
      gridOpacity: 0.25,
      mountainsFragmentShader: MOUNTAINS_FRAGMENT_SHADER,
      mountainsVertexShader: MOUNTAINS_VERTEX_SHADER,
      landVertexShader: LAND_VERTEX_SHADER,
      landFragmentShader: LAND_FRAGMENT_SHADER,

      // options per tree index, varying the different kinds of trees a little
      treeOptions: [
        { treesPerForest: 0 },
        {
          // tundra trees
          treesPerForest: 0,
        },
        {
          // snowy trees
          treesPerForest: 0,
          scale: 0.85,
        }, // no options for tropical forests (index = 3)
      ],
    };

    const mapView = new MapView(this.canvasRef);
    mapView.load(map, options);
    initInput(mapView);
    const controller = mapView.controller as Controller;
    controller.debugOutput = this.debugRef.nativeElement;
    mapView.onLoaded = () => { };

    mapView.onTileSelected = (tile: TileData) => {
      console.log(tile);
    };
  }
}