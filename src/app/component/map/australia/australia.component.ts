import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HexGeneratorService } from 'src/app/services/hex-generator.service';
import { australiaTileData } from 'src/app/tile-data';
import { PerspectiveCamera, WebGLRenderer, Scene, PMREMGenerator, Raycaster, Vector2, Color, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DistictComponent } from '../../distict/distict.component';

@Component({
  selector: 'app-australia',
  templateUrl: './australia.component.html',
  styleUrls: ['./australia.component.css']
})
export class AustraliaComponent implements OnInit {
  @ViewChild('canvas') canvasRef: ElementRef;

  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private scene: Scene = new Scene();
  pmrem !: PMREMGenerator;
  raycaster = new Raycaster();
  mouse = new Vector2();
  controls: OrbitControls;
  isDialogedOpen = false;

  zoomLevel = 6;
  maxZoomLevel = 10;
  minZoomLevel = 1;

  constructor(private hexGenerator: HexGeneratorService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  openDialog(tileID) {
    this.isDialogedOpen = true;
    const dialogRef = this.dialog.open(DistictComponent
      , { height: '600px', data: { tileID: tileID } }
    );

    dialogRef.afterClosed().subscribe(result => {
      this.isDialogedOpen = false;
    });
  }
  async initializeScene() {
    this.scene.background = new Color("#0E5378");
    this.camera = this.hexGenerator.updateCamera(80, 0, 20, 0);
    this.renderer = this.hexGenerator.addRenderer(this.canvasRef);
    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();

    const texture = await this.hexGenerator.loadTexture();
    const envMap = await this.hexGenerator.updateEnvMap(this.pmrem);

    const tileData = {
      stoneTile: australiaTileData.stoneTile,
      sandTile: australiaTileData.sandTile,
      dirtTile: australiaTileData.dirtTile,
      grassTile: australiaTileData.grassTile
    }

    this.hexGenerator.createHexMap(texture, envMap, 9, 9, this.scene, tileData);
    this.controls = this.hexGenerator.addOrbitalControl(this.camera, this.renderer);
    this.hexGenerator.addLight(this.scene);

    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });

    window.addEventListener('click', this.onClick.bind(this), false);
    document.addEventListener('wheel', this.worldZoom.bind(this), false);
  }

  onClick(event) {
    if (this.isDialogedOpen) {
      return;
    }
    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length >= 1) {
      this.openDialog(intersects[0].object["geometry"].name);
      // console.log(intersects[0].object["geometry"].name)
    }
  }

  ngAfterViewInit(): void {
    this.initializeScene();
  }

  worldZoom(event) {
    if (this.isDialogedOpen) {
      return;
    }
    if (event.deltaY < 0 && this.zoomLevel <= this.maxZoomLevel)
    {
      let factor = 1;
      let mX = (event.clientX / innerWidth) * 2 - 1;
      let mY = -(event.clientY / innerHeight) * 2 + 1;
      let vector = new Vector3(mX, mY, 0.1);
      vector.unproject(this.camera);
      vector.sub(this.camera.position);
      this.camera.position.addVectors(this.camera.position, vector.setLength(factor));
      this.controls.target.addVectors(this.controls.target, vector.setLength(factor));
      this.zoomLevel++;
    }
    else if (event.deltaY > 0 && this.zoomLevel > this.minZoomLevel )
    {
      let factor = 1;
      let mX = (event.clientX / innerWidth) * 2 - 1;
      let mY = -(event.clientY / innerHeight) * 2 + 1;
      let vector = new Vector3(mX, mY, 0.1);
      vector.unproject(this.camera);
      vector.sub(this.camera.position);
      this.camera.position.subVectors(this.camera.position, vector.setLength(factor));
      this.controls.target.subVectors(this.controls.target, vector.setLength(factor));
      this.zoomLevel--;
    }
    event.stopPropagation();
  }

}
