import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { asiaTileData } from 'src/app/tile-data';
import {
  Color,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { HexGeneratorService } from '../../../services/hex-generator.service';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LAND_VERTEX_SHADER } from 'src/assets/shaders/land.vertex';
import { LAND_FRAGMENT_SHADER } from 'src/assets/shaders/land.fragment';
import { generateMapView } from 'src/utility/generateRandomMap';
import { MOUNTAINS_FRAGMENT_SHADER } from 'src/shaders/mountains.fragment';
import { MOUNTAINS_VERTEX_SHADER } from 'src/shaders/mountains.vertex';
import { MapMeshOptions } from 'src/utility/MapMesh';
import { HttpClient } from '@angular/common/http';
import MapView from 'src/utility/MapView';
import { initInput } from 'src/utility/input';
import Controller from 'src/utility/DefaultMapViewController';
import { TileData } from 'src/utility/interfaces';

/**
 * @param fog whether there should be fog on this tile making it appear darker
 * @param clouds whether there should be "clouds", i.e. an opaque texture, hiding the tile
 * @param range number of tiles around the given tile that should be updated
 * @param tile tile around which fog should be updated
 */
function setFogAround(
  mapView: MapView,
  tile: TileData,
  range: number,
  fog: boolean,
  clouds: boolean
) {
  const tiles = mapView.getTileGrid().neighbors(tile.q, tile.r, range);

  const updated = tiles.map((t) => {
    t.fog = fog;
    t.clouds = clouds;
    return t;
  });

  mapView.updateTiles(updated);
}

@Component({
  selector: 'app-asia',
  templateUrl: './asia.component.html',
  styleUrls: ['./asia.component.css'],
})
export class AsiaComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef: ElementRef;
  @ViewChild('text') textRef: ElementRef;
  @ViewChild('debug') debugRef: ElementRef;

  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private scene: Scene = new Scene();
  pmrem!: PMREMGenerator;
  raycaster = new Raycaster();
  mouse = new Vector2();

  constructor(
    private hexGenerator: HexGeneratorService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    const mapSize = 24;

    const map = await generateMapView(mapSize);
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
    console.log({ terrainAtlas });
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
      treesPerForest: 50,
      gridWidth: 0.025,
      gridColor: new Color(0x42322b),
      gridOpacity: 0.25,
      mountainsFragmentShader: MOUNTAINS_FRAGMENT_SHADER,
      mountainsVertexShader: MOUNTAINS_VERTEX_SHADER,
      landVertexShader: LAND_VERTEX_SHADER,
      landFragmentShader: LAND_FRAGMENT_SHADER,

      // options per tree index, varying the different kinds of trees a little
      treeOptions: [
        //@ts-ignore
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
    console.log(this.canvasRef);
    const mapView = new MapView(this.canvasRef);
    mapView.load(map, options);
    initInput(mapView);
    const controller = mapView.controller as Controller;
    controller.debugOutput = this.debugRef.nativeElement;
    mapView.onLoaded = () => {
      // uncover tiles around initial selection
      setFogAround(mapView, mapView.selectedTile, 10, true, false);
      setFogAround(mapView, mapView.selectedTile, 5, false, false);
    };

    mapView.onTileSelected = (tile: TileData) => {
      // uncover tiles around selection
      setFogAround(mapView, tile, 2, false, false);
    };
  }

  // async initializeScene() {
  //   this.scene.background = new Color("#002e54");
  //   this.camera = this.hexGenerator.updateCamera(45, 0, 80, 0);
  //   this.renderer = this.hexGenerator.addRenderer(this.canvasRef);
  //   this.pmrem = new PMREMGenerator(this.renderer);
  //   this.pmrem.compileEquirectangularShader();

  //   // this.hexGenerator.createHexMap(texture, envMap, 9, 9, this.scene, tileData);
  //   const controls = new OrbitControls(this.camera, this.renderer.domElement);
  //   var ambientLight = new THREE.AmbientLight(0xffffff); //color of the light
  //   ambientLight.intensity = 1;
  //   this.scene.add(ambientLight);

  //   this.renderer.setAnimationLoop(() => {
  //     controls.update();
  //     this.renderer.render(this.scene, this.camera);
  //   });

  //   const dirt = await new TextureLoader().loadAsync("assets/mouna.png")
  //   this.createHexagonShape(dirt);
  // }

  // createHexagonShape(texture) {

  //   //create hexagon shape
  //   var hexagon = new THREE.CylinderGeometry(1, 1, 0, 6);

  //   let stoneMaterial = new THREE.MeshPhongMaterial({
  //     color:0xffffff,
  //     map: texture
  //   })

  //   var hex = new THREE.Mesh(hexagon, stoneMaterial);

  //   hex.position.set(0, 0, 0);

  //   //add the hexTileMap to the scene
  //   this.scene.add(hex);
  //   // window.addEventListener('click', this.onClick.bind(this), false);

  // }

  // tileToPosition(tileX, tileY): Vector2 {
  //   return new Vector2((tileX + (tileY % 2) * 0.5) * 1.71, tileY * 1.50);
  // }
  // onClick(event) {
  //   this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
  //   this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
  //   this.raycaster.setFromCamera(this.mouse, this.camera);
  //   const intersects = this.raycaster.intersectObjects(this.scene.children) as any;

  //   console.log(intersects[0].object.position);

  // }

  ngAfterViewInit(): void {
    // this.initializeScene();
  }

  // rawShaderMaterial(texture) {
  //   // create the material with custom shaders
  //   var material = new THREE.RawShaderMaterial({
  //     uniforms: {
  //       texture: {
  //         value: texture
  //       }
  //     },
  //     vertexShader: LAND_VERTEX_SHADER,
  //     fragmentShader: LAND_FRAGMENT_SHADER,
  //   });

  //   return material;
  // }
}
