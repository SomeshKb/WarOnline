import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HexGeneratorService } from 'src/app/services/hex-generator.service';
import { australiaTileData } from 'src/app/tile-data';
import { PerspectiveCamera, WebGLRenderer, Scene, PMREMGenerator, Raycaster, Vector2, Color } from 'three';
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

  isDialogedOpen = false;

  constructor(private hexGenerator: HexGeneratorService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  openDialog(tileID) {
    this.isDialogedOpen = true;
    const dialogRef = this.dialog.open(DistictComponent
      , { height: '400px', data: { tileID: tileID } }
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
    const controls = this.hexGenerator.addOrbitalControl(this.camera, this.renderer);
    this.hexGenerator.addLight(this.scene);

    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });

    window.addEventListener('click', this.onClick.bind(this), false);
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
    }
  }

  ngAfterViewInit(): void {
    this.initializeScene();
  }

}
