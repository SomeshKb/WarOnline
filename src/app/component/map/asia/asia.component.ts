import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { asiaTileData } from "src/app/tile-data";
import { Color, PerspectiveCamera, PMREMGenerator, Raycaster, Scene, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { HexGeneratorService } from "../../../services/hex-generator.service";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { LAND_VERTEX_SHADER } from "src/assets/shaders/land.vertex";
import { LAND_FRAGMENT_SHADER } from "src/assets/shaders/land.fragment";
@Component({
  selector: 'app-asia',
  templateUrl: './asia.component.html',
  styleUrls: ['./asia.component.css']
})
export class AsiaComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas') canvasRef: ElementRef;

  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private scene: Scene = new Scene();
  pmrem !: PMREMGenerator;
  raycaster = new Raycaster();
  mouse = new Vector2();

  constructor(private hexGenerator: HexGeneratorService) {
  }

  ngOnInit(): void {
  }

  async initializeScene() {
    this.scene.background = new Color("#002e54");
    this.camera = this.hexGenerator.updateCamera(45, 0, 40, 0);
    this.renderer = this.hexGenerator.addRenderer(this.canvasRef);
    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();

    // this.hexGenerator.createHexMap(texture, envMap, 9, 9, this.scene, tileData);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    var ambientLight = new THREE.AmbientLight(0x404040); //color of the light
    ambientLight.intensity = 2;
    this.scene.add(ambientLight);

    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });

    const dirt = await new TextureLoader().loadAsync("assets/materials/land.png")
    this.createHexagonShape(dirt);
  }

  createHexagonShape(texture) {

    //create hexagon shape
    var hexagon = new THREE.CylinderGeometry(1, 1, 0, 6);
    var hexagonMaterial = new THREE.MeshPhongMaterial({ color: 0x10b035 });

    let stoneMaterial = new THREE.MeshBasicMaterial({
      map: texture
    })

    var hex = new THREE.Mesh(hexagon, hexagonMaterial);

    hex.position.set(0, 0, 0);

    //add the hexTileMap to the scene
    this.scene.add(hex);
    window.addEventListener('click', this.onClick.bind(this), false);

  }

  tileToPosition(tileX, tileY): Vector2 {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.73, tileY * 1.50);
  }
  onClick(event) {
    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children) as any;

    console.log(intersects[0].object.position);

  }

  ngAfterViewInit(): void {
    this.initializeScene();
  }

  rawShaderMaterial(texture) {
    // create the material with custom shaders
    var material = new THREE.RawShaderMaterial({
      uniforms: {
        texture: {
          value: texture
        }
      },
      vertexShader: LAND_VERTEX_SHADER,
      fragmentShader: LAND_FRAGMENT_SHADER,
    });

    return material;
  }


}
