import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HexGeneratorService } from 'src/app/services/hex-generator.service';
import { australiaTileData, distictTileData } from 'src/app/tile-data';
import { PerspectiveCamera, WebGLRenderer, Scene, PMREMGenerator, Raycaster, Vector2, Color, ACESFilmicToneMapping, PCFShadowMap, sRGBEncoding } from 'three';
@Component({
  selector: 'app-distict',
  templateUrl: './distict.component.html',
  styleUrls: ['./distict.component.css']
})
export class DistictComponent implements OnInit, AfterViewInit {
  tileID = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { tileID: string }, private hexGenerator: HexGeneratorService, public dialog: MatDialog) {
    this.tileID = data.tileID;
  }

  @ViewChild('canvas') canvasRef: ElementRef;

  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private scene: Scene = new Scene();
  pmrem !: PMREMGenerator;
  raycaster = new Raycaster();
  mouse = new Vector2();

  ngOnInit(): void {
  }


  async initializeScene() {
    this.scene.background = new Color("#0E5378");
    this.camera = this.hexGenerator.updateCamera(80, 0, 15, 0);

    const height = innerHeight/1.6;
    const width = innerWidth/3.5;


    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.nativeElement, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(width/height);
    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();
    this.camera.aspect =width/height;
    this.camera.updateProjectionMatrix();
    const texture = await this.hexGenerator.loadTexture();
    const envMap = await this.hexGenerator.updateEnvMap(this.pmrem);

    const tileData = {
      distict: distictTileData
    };

    this.hexGenerator.createDistictHexMap(texture, envMap, 6, 6, this.scene, tileData);
    const controls = this.hexGenerator.addOrbitalControl(this.camera, this.renderer);

    controls.enableZoom = false;

    // to disable rotation
    controls.enableRotate = false;

    // to disable pan
    controls.enablePan = false;

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
      // do something
      console.log(intersects[0].object["geometry"].name)
    }
  }

  ngAfterViewInit(): void {
    this.initializeScene();
  }
}