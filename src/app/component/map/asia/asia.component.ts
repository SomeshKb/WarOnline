import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { dirtTile, grassTile, sandTile, stoneTile } from "src/app/data";
import { ACESFilmicToneMapping, AxesHelper, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DirectionalLight, DirectionalLightHelper, FloatType, Mesh, MeshPhysicalMaterial, PCFShadowMap, PerspectiveCamera, PMREMGenerator, PointLight, RectAreaLight, Scene, SphereGeometry, sRGBEncoding, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

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
  mousePos = new Vector2(0, 0);
  pmrem !: PMREMGenerator;

  stoneGeo !: BoxGeometry | BufferGeometry;
  dirtGeo !: BoxGeometry | BufferGeometry;
  dirt2Geo !: BoxGeometry | BufferGeometry;
  sandGeo !: BoxGeometry | BufferGeometry;
  grassGeo !: BoxGeometry | BufferGeometry;
  seaGeo !: BoxGeometry | BufferGeometry;

  constructor(){
  }

  ngOnInit(): void {
  }

  async initialize() {

    this.createBoxGeometry();
    this.scene.background = new Color("#002e54");
    this.updateCamera();
    this.updatedRenderer();

    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();


    const texture = await this.loadTexture();
    const envMap = this.updateEnvMap();
    this.createHexMap(texture, envMap);

    const controls = this.addOrbitalControl();
    this.addLight();

    this.renderer.setAnimationLoop(() => {
      controls.update();
      this.renderer.render(this.scene, this.camera);
    });
    // window.addEventListener('wheel', (event) => {
    //   event.preventDefault(); /// prevent scrolling

    //   console.log(event);

    //   let zoom = this.camera.zoom; // take current zoom value
    //   zoom += event.deltaY * -0.01; /// adjust it
    //   zoom = Math.min(Math.max(.125, zoom), 4); /// clamp the value

    //   this.camera.zoom = zoom /// assign new zoom value
    //   this.camera.updateProjectionMatrix(); /// make the changes take effect
    // }, { passive: false });
  }

  async updateEnvMap(){
    const envMapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    const envMap = this.pmrem.fromEquirectangular(envMapTexture).texture;
    return envMap;
  }

  updateCamera() {
    this.camera = new PerspectiveCamera(80, innerWidth / innerHeight, 10, 100);
    this.camera.position.set(0, 50, 0);
  }

  createBoxGeometry() {
    this.stoneGeo = new BoxGeometry(0, 0, 0);
    this.dirtGeo = new BoxGeometry(0, 0, 0);
    this.dirt2Geo = new BoxGeometry(0, 0, 0);
    this.sandGeo = new BoxGeometry(0, 0, 0);
    this.grassGeo = new BoxGeometry(0, 0, 0);
    this.seaGeo = new BoxGeometry(0, 0, 0);
  }

  updatedRenderer() {
    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.nativeElement });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
  }

  tileToPosition(tileX, tileY): Vector2 {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }

  addOrbitalControl(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.5;
    controls.enableDamping = true;
    // controls.enableRotate = false;
    controls.maxZoom = 100.00;
    controls.minZoom = 1.0;

    return controls;
  }

  addAxesHelper() {
    const axesHelper = new AxesHelper(5);
    axesHelper.position.set(0, 10, 0);
    this.scene.add(axesHelper);
  }

  addLight() {
    // const light = new PointLight(new Color("#FFCBBE").convertSRGBToLinear(), 10, 2000);
    // light.position.set(-10, 10, 0);
    // light.castShadow = true;
    // light.shadow.mapSize.width = 512;
    // light.shadow.mapSize.height = 512;
    // light.shadow.camera.near = 0.5;
    // light.shadow.camera.far = 500;
    // this.scene.add(light);

    const light = new DirectionalLight(new Color(0xFFFFFF).convertSRGBToLinear(), 1);
    light.position.set(0, 100, 0);
    const helper = new DirectionalLightHelper(light, 10);
    this.scene.add(helper);
    this.scene.add(light);
  }

  createHexGeometry(height, position) {
    const geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    return geo;
  }

  createHexagonTiles(height, position, tileIndex) {
    const geo = this.createHexGeometry(height, position);

    if (stoneTile.indexOf(tileIndex) >= 0) {
      this.stoneGeo = mergeBufferGeometries([geo, this.stoneGeo]);
      if (Math.random() > 0.3) {
        this.stoneGeo = mergeBufferGeometries([this.stoneGeo, this.createStone(height, position)]);
      }
      return;
    }

    if (sandTile.indexOf(tileIndex) >= 0) {
      this.sandGeo = mergeBufferGeometries([geo, this.sandGeo]);
      if (Math.random() > 0.3) {
        this.sandGeo = mergeBufferGeometries([this.sandGeo, this.createStone(height, position)]);
      }
      return;
    }

    if (dirtTile.indexOf(tileIndex) >= 0) {
      this.dirtGeo = mergeBufferGeometries([geo, this.dirtGeo]);
      if (Math.random() > 0.1) {
        // this.grassGeo = mergeBufferGeometries([this.grassGeo, this.createTree(height, position)]);
      }
      return;
    }

    if (grassTile.indexOf(tileIndex) >= 0) {
      this.grassGeo = mergeBufferGeometries([geo, this.grassGeo]);
      if (Math.random() > 0.8) {
        // this.grassGeo = mergeBufferGeometries([this.grassGeo, this.createTree(height, position)]);
      }
      return;
    }
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  createHexMap(texture, envMap) {
    let count = 0;
    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        this.createHexagonTiles(1, this.tileToPosition(i, j), count++);
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
    const stoneMesh = this.hexMesh(this.stoneGeo as BoxGeometry, textures.stone, envMap);
    const grassMesh = this.hexMesh(this.grassGeo as BoxGeometry, textures.grass, envMap);
    const dirt2Mesh = this.hexMesh(this.dirt2Geo as BoxGeometry, textures.dirt2, envMap);
    const dirtMesh = this.hexMesh(this.dirtGeo as BoxGeometry, textures.dirt, envMap);
    const sandMesh = this.hexMesh(this.sandGeo as BoxGeometry, textures.sand, envMap);
    const seaMesh = this.createSeaMesh(this.seaGeo as BoxGeometry, textures.water, envMap)
    this.scene.add(stoneMesh, grassMesh, dirt2Mesh, dirtMesh, sandMesh, seaMesh);
  }

  hexMesh(geo: BoxGeometry, map: Texture, envMap) {
    const mat = new MeshPhysicalMaterial({
      envMap: envMap,
      envMapIntensity: 0.135,
      flatShading: true,
      map: map
    });

    const mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }


  createSeaMesh(geo: BoxGeometry, waterTexture: Texture, envMap) {
    const seaMesh = new Mesh(geo,
      new MeshPhysicalMaterial({
        envMap: envMap,
        color: new Color("#55aaff").convertSRGBToLinear().multiplyScalar(3),
        ior: 1.4,
        transmission: 1,
        transparent: true,
        envMapIntensity: 0.9,
        roughness: 1,
        metalness: 0.5,
        roughnessMap: waterTexture,
        metalnessMap: waterTexture
      })
    );

    seaMesh.castShadow = true;

    return seaMesh;
  }


  createStone(height, position) {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;

    const geo = new SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7)
    geo.translate(position.x + px, height, position.y + pz);
    return geo;
  }

  createTree(height, position) {
    const treeHeight = Math.random();

    const geo = new CylinderGeometry(0, 1.5, treeHeight, 3);
    geo.translate(position.x, height + treeHeight * 0 + 1, position.y);

    const geo2 = new CylinderGeometry(0, 1.15, treeHeight, 3);
    geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);

    const geo3 = new CylinderGeometry(0, 0.8, treeHeight, 3);
    geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);

    return mergeBufferGeometries([geo, geo2, geo3]);
  }

}
