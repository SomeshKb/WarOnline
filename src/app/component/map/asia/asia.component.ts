import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { asiaTileData } from "src/app/tile-data";
import { Color, PerspectiveCamera, PMREMGenerator, Raycaster, Scene, Vector2, WebGLRenderer } from "three";
import { HexGeneratorService } from "../../../services/hex-generator.service";

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
    this.camera = this.hexGenerator.updateCamera(80, 0, 20, 0);
    this.renderer = this.hexGenerator.addRenderer(this.canvasRef);
    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();

    const texture = await this.hexGenerator.loadTexture();
    const envMap = await this.hexGenerator.updateEnvMap(this.pmrem);

    const tileData = {
      stoneTile: asiaTileData.stoneTile,
      sandTile: asiaTileData.sandTile,
      dirtTile: asiaTileData.dirtTile,
      grassTile: asiaTileData.grassTile
    }

    this.hexGenerator.createHexMap(texture, envMap, 9, 9, this.scene, tileData);
    const controls = this.hexGenerator.addOrbitalControl(this.camera, this.renderer);
    this.hexGenerator.addLight(this.scene);
    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });

    window.addEventListener('click', this.onClick.bind(this), false);
  }

  onClick(event) {
    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length >= 1) {
      console.log(intersects[0].object["geometry"].name)
    }
  }

  ngAfterViewInit(): void {
    // this.initializeScene();
  }
}
