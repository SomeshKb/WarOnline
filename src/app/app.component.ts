import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import * as THREE from "three";
import { BoxGeometry, CylinderGeometry, FloatType, MeshBasicMaterial, MeshStandardMaterial, SphereGeometry, TextureLoader, Vector2 } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas') canvasRef: ElementRef;

  private camera!: THREE.PerspectiveCamera;

  private renderer!: THREE.WebGLRenderer;

  private scene: THREE.Scene = new THREE.Scene();
  mousePos = new THREE.Vector2(0, 0);
  pmrem !: THREE.PMREMGenerator;
  hexagonGeometeries !: THREE.BoxGeometry | THREE.BufferGeometry;

  async initialize() {
    this.scene.background = new THREE.Color("white");
    this.camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 10, 1000);

    this.camera.position.set(0, 60, 16);
    const aspectRatio = this.getAspectRatio();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvasRef.nativeElement });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(devicePixelRatio);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.5;
    controls.enableDamping = true;

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    // this.pmrem.compileEquirectangularShader();
    this.hexagonGeometeries = new BoxGeometry(0, 0, 0);

    const envMapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    const envMap = this.pmrem.fromEquirectangular(envMapTexture).texture;

    this.scene.add(this.createHexMap(envMap));

    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }

  hexGeometry(height, position) {
    let geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    return geo;
  }

  makeHex(height, position) {
    let geo = this.hexGeometry(height, position);
    this.hexagonGeometeries = mergeBufferGeometries([this.hexagonGeometeries, geo])
  }

  ngAfterViewInit(): void {
    this.initialize();
  }
  getAspectRatio() {
    return this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
  }

  createHexMap(envMap) {
    for (let i = -15; i < 15; i++) {
      for (let j = -15; j < 15; j++) {
        this.makeHex(1, this.tileToPosition(i, j));
      }
    }
    const hexagonMesh = new THREE.Mesh(this.hexagonGeometeries, new MeshStandardMaterial({
      envMap: envMap,
      flatShading: true
    }))

    return hexagonMesh;
  }

  async loadTexture() {
    const textures = {
      dirt: await new TextureLoader().loadAsync("assets/dirt.png"),
      dirt2: await new TextureLoader().loadAsync("assets/dirt2.jpg"),
      grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
      sand: await new TextureLoader().loadAsync("assets/sand.jpg"),
      water: await new TextureLoader().loadAsync("assets/water.jpg"),
      stone: await new TextureLoader().loadAsync("assets/stone.png"),
    };

    return textures;
  }


  createMeshTexture(textures) {
    const stoneGeo = new BoxGeometry(0, 0, 0);
    const dirtGeo = new BoxGeometry(0, 0, 0);
    const dirt2Geo = new BoxGeometry(0, 0, 0);
    const sandGeo = new BoxGeometry(0, 0, 0);
    const grassGeo = new BoxGeometry(0, 0, 0);
      const stoneMesh= this.hexMesh(stoneGeo, textures.stone)
      const grassMesh= this.hexMesh(grassGeo, textures.grass)
      const dirt2Mesh= this.hexMesh(dirt2Geo, textures.dirt2)
      const dirtMesh= this.hexMesh(dirtGeo, textures.dirt)
      const sandMesh= this.hexMesh(sandGeo, textures.sand)
      

  }
  hexMesh(stoneGeo: THREE.BoxGeometry, stone: any) {

  }
  
}

