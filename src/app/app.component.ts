import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { ACESFilmicToneMapping, AmbientLight, BoxGeometry, BufferGeometry, Color, CylinderGeometry, FloatType, Mesh, MeshPhysicalMaterial, PCFShadowMap, PerspectiveCamera, PMREMGenerator, PointLight, Scene, SphereGeometry, sRGBEncoding, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { dirtTile, grassTile, sandTile, stoneTile } from "./data";

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

  stoneGeo !: BoxGeometry | BufferGeometry;
  dirtGeo !: BoxGeometry | BufferGeometry;
  dirt2Geo !: BoxGeometry | BufferGeometry;
  sandGeo !: BoxGeometry | BufferGeometry;
  grassGeo !: BoxGeometry | BufferGeometry;
  seaGeo !: BoxGeometry | BufferGeometry;

  async initialize() {

    this.stoneGeo = new BoxGeometry(0, 0, 0);
    this.dirtGeo = new BoxGeometry(0, 0, 0);
    this.dirt2Geo = new BoxGeometry(0, 0, 0);
    this.sandGeo = new BoxGeometry(0, 0, 0);
    this.grassGeo = new BoxGeometry(0, 0, 0);
    this.seaGeo = new BoxGeometry(0, 0, 0);

    this.scene.background = new Color("black");

    this.camera = new PerspectiveCamera(45, innerWidth / innerHeight, 10, 1000);
    this.camera.position.set(0, 60, 16);

    this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvasRef.nativeElement });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);


    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.5;
    controls.enableDamping = true;
    // controls.enableRotate = false;
    controls.maxZoom = 100.00;
    controls.minZoom = 1.0;



    this.addLight();

    this.pmrem = new PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();
    const envMapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    const envMap = this.pmrem.fromEquirectangular(envMapTexture).texture;
    const texture = await this.loadTexture();
    this.createHexMap(texture, envMap);

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

  tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }

  addLight() {
    const light = new PointLight(new Color("#FFCBBE").convertSRGBToLinear(), 1, 2000);
    light.position.set(0, 60, 16);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    this.scene.add(light);
  }

  hexGeometry(height, position) {
    const geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    return geo;
  }

  makeHex(height, position, tileIndex) {
    const geo = this.hexGeometry(height, position);

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
    this.seaGeo = mergeBufferGeometries([geo, this.seaGeo]);
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  createHexMap(texture, envMap) {
    let count = 0;
    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        this.makeHex(1, this.tileToPosition(i, j), count++);
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
        envMapIntensity: 0.5,
        roughness: 1,
        metalness: 0.1,
        roughnessMap: waterTexture,
        metalnessMap: waterTexture
      })
    );

    // seaMesh.castShadow = true;

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
