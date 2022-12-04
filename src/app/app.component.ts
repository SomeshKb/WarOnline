import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import * as THREE from "three";
import { BoxGeometry, CylinderGeometry } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('canvas') canvasRef: ElementRef;

  texture: string = "/assets/texture.jpg";

  private loader = new THREE.TextureLoader();
  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshBasicMaterial({ map: this.loader.load(this.texture) })

  private camera!: THREE.PerspectiveCamera;


  private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  ngAfterViewInit(): void {
    this.createScene();
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(100, 0, 100);


    const aspectRatio = this.getAspectRatio();
    console.log(aspectRatio)
    this.camera = new THREE.PerspectiveCamera(
      1,
      10,
      1,
      1000
    );
    this.camera.position.z = 400;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement });
    // this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);
    this.renderer.render(this.scene, this.camera);

    this.renderer.render(this.scene, this.camera);

  }

  getAspectRatio() {
    return this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
  }




}
