import { ElementRef, Injectable } from '@angular/core';
import { ACESFilmicToneMapping, AxesHelper, BoxGeometry, BufferGeometry, Camera, Color, CylinderGeometry, DirectionalLight, FloatType, Mesh, MeshPhysicalMaterial, PCFShadowMap, PerspectiveCamera, Renderer, Scene, SphereGeometry, sRGBEncoding, Texture, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

@Injectable({
  providedIn: 'root'
})
export class HexGeneratorService {

  constructor() { }

  async updateEnvMap(pmrem) {
    const envMapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    const envMap = pmrem.fromEquirectangular(envMapTexture).texture;
    return envMap;
  }

  addRenderer(canvasRef: ElementRef) {
    const renderer = new WebGLRenderer({ antialias: true, canvas: canvasRef.nativeElement });
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.outputEncoding = sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.setPixelRatio(devicePixelRatio);
    return renderer;
  }

  updateCamera(angle, x, y, z) {
    const camera = new PerspectiveCamera(angle, innerWidth / innerHeight, 10, 100);
    camera.position.set(x, y, z);
    return camera;
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

  createHexMap(texture, envMap, height, width, scene,tileData) {
    let count = 0;
    for (let i = -height; i < height; i++) {
      for (let j = -width; j < width; j++) {
        this.createHexagonTiles(0.2, this.tileToPosition(i, j), count++, texture, envMap, scene,tileData);
      }
    }
  }

  tileToPosition(tileX, tileY): Vector2 {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }

  createHexagonTiles(height, position, tileIndex, textures, envMap, scene,tiledata) {
    const geo = this.createHexGeometry(height, position);
    geo.name = tileIndex;
    // const mesh = this.createSeaMesh(geo , textures.water, envMap);
    // this.scene.add(mesh);

    if (tiledata.stoneTile.indexOf(tileIndex) >= 0) {
      this.createAndAddMeshTexture(geo, textures.stone, envMap, scene);

      if (Math.random() > 0.3) {
        this.createAndAddMeshTexture(this.createStone(height, position), textures.stone, envMap, scene);
      }
      return;
    }

    if (tiledata.sandTile.indexOf(tileIndex) >= 0) {
      this.createAndAddMeshTexture(geo, textures.sand, envMap, scene);

      if (Math.random() > 0.3) {
        this.createAndAddMeshTexture(this.createStone(height, position), textures.sand, envMap, scene);
      }
      return;
    }

    if (tiledata.dirtTile.indexOf(tileIndex) >= 0) {
      this.createAndAddMeshTexture(geo, textures.dirt, envMap, scene);

      if (Math.random() > 0.1) {
        // this.grassGeo = mergeBufferGeometries([this.grassGeo, this.createTree(height, position)]);
      }
      return;
    }

    if (tiledata.grassTile.indexOf(tileIndex) >= 0) {
      this.createAndAddMeshTexture(geo, textures.grass, envMap, scene);

      if (Math.random() > 0.8) {
        // this.grassGeo = mergeBufferGeometries([this.grassGeo, this.createTree(height, position)]);
      }
      return;
    }
  }

  createHexGeometry(height, position): CylinderGeometry {
    const geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);
    return geo;
  }

  createAndAddMeshTexture(geometry, textures, envMap, scene) {
    const mesh = this.hexMesh(geometry, textures, envMap);
    scene.add(mesh);
  }


  hexMesh(geo: BoxGeometry, map: Texture, envMap): Mesh<BoxGeometry, MeshPhysicalMaterial> {
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

  createStone(height, position): SphereGeometry {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;

    const geo = new SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7)
    geo.translate(position.x + px, height, position.y + pz);
    return geo;
  }

  createTree(height, position): BufferGeometry {
    const treeHeight = Math.random();

    const geo = new CylinderGeometry(0, 1.5, treeHeight, 3);
    geo.translate(position.x, height + treeHeight * 0 + 1, position.y);

    const geo2 = new CylinderGeometry(0, 1.15, treeHeight, 3);
    geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);

    const geo3 = new CylinderGeometry(0, 0.8, treeHeight, 3);
    geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);

    return mergeBufferGeometries([geo, geo2, geo3]);
  }


  createSeaMesh(geo, waterTexture: Texture, envMap) {
    const seaMesh = new Mesh(geo,
      new MeshPhysicalMaterial({
        envMap: envMap,
        color: new Color("#55aaff").convertSRGBToLinear().multiplyScalar(3),
      })
    );
    return seaMesh;
  }

  addOrbitalControl(camera: Camera, renderer: Renderer): OrbitControls {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.dampingFactor = 0.5;
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.maxZoom = 100.00;
    controls.minZoom = 1.0;
    return controls;
  }

  addAxesHelper(scene: Scene) {
    const axesHelper = new AxesHelper(5);
    axesHelper.position.set(0, 10, 0);
    scene.add(axesHelper);
  }

  addLight(scene: Scene) {
    const light = new DirectionalLight(new Color(0xFFFFFF).convertSRGBToLinear(), 1);
    light.position.set(0, 100, 0);
    scene.add(light);
  }


}
