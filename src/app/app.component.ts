import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { ACESFilmicToneMapping, BoxGeometry, BufferGeometry, Color, CylinderGeometry, FloatType, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, sRGBEncoding, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas') canvasRef: ElementRef;

  private camera!: PerspectiveCamera;

  private renderer!: WebGLRenderer;

  private scene: Scene = new Scene();
  mousePos = new Vector2(0, 0);
  pmrem !: PMREMGenerator;
  hexagonGeometeries !: BoxGeometry | BufferGeometry;

  stoneGeo !: BoxGeometry | BufferGeometry;
  dirtGeo !: BoxGeometry | BufferGeometry;
  dirt2Geo !: BoxGeometry | BufferGeometry;
  sandGeo !: BoxGeometry | BufferGeometry;
  grassGeo !: BoxGeometry | BufferGeometry;

  async initialize() {

    this.stoneGeo = new BoxGeometry(0, 0, 0);
    this.dirtGeo = new BoxGeometry(0, 0, 0);
    this.dirt2Geo = new BoxGeometry(0, 0, 0);
    this.sandGeo = new BoxGeometry(0, 0, 0);
    this.grassGeo = new BoxGeometry(0, 0, 0);


    this.scene.background = new Color("white");
    this.camera = new PerspectiveCamera(45, innerWidth / innerHeight, 10, 1000);

    this.camera.position.set(0, 60, 16);
    const aspectRatio = this.getAspectRatio();
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.nativeElement });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(devicePixelRatio);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.5;
    controls.enableDamping = true;

    this.pmrem = new PMREMGenerator(this.renderer);
    // this.pmrem.compileEquirectangularShader();
    this.hexagonGeometeries = new BoxGeometry(0, 0, 0);
    const envMapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    const envMap = this.pmrem.fromEquirectangular(envMapTexture).texture;
    const texture = await this.loadTexture();
    this.createHexMap(texture, envMap)

    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }

  hexGeometry(height, position) {
    let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    return geo;
  }

  makeHex(height, position) {
    let geo = this.hexGeometry(height, position);
    // this.grassGeo = mergeBufferGeometries([this.grassGeo, geo]);

    if (position.x == 0) {
      this.stoneGeo = mergeBufferGeometries([geo, this.stoneGeo]);
    } else {
      this.dirtGeo = mergeBufferGeometries([geo, this.dirtGeo]);
    }
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  getAspectRatio() {
    return this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
  }

  createHexMap(texture, envMap) {
    for (let i = -15; i < 15; i++) {
      for (let j = -15; j < 15; j++) {
        this.makeHex(1, this.tileToPosition(i, j));
      }
    }

    this.createMeshTexture(texture, envMap);

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

  createMeshTexture(textures, envMap) {
    debugger
    const stoneMesh = this.hexMesh(this.stoneGeo as BoxGeometry, textures.stone, envMap);
    const grassMesh = this.hexMesh(this.grassGeo as BoxGeometry, textures.grass, envMap);
    const dirt2Mesh = this.hexMesh(this.dirt2Geo as BoxGeometry, textures.dirt2, envMap);
    const dirtMesh = this.hexMesh(this.dirtGeo as BoxGeometry, textures.dirt, envMap);
    const sandMesh = this.hexMesh(this.sandGeo as BoxGeometry, textures.sand, envMap);
    this.scene.add(stoneMesh, grassMesh, dirt2Mesh, dirtMesh, sandMesh);
  }

  hexMesh(geo: BoxGeometry, map: Texture, envMap) {
    let mat = new MeshPhysicalMaterial({
      envMap: envMap,
      envMapIntensity: 0.135,
      flatShading: true,
      map: map
    });

    let mesh = new Mesh(geo, mat);
    return mesh;
  }

}

