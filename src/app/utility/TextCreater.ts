import { Vector3, MeshBasicMaterial, Mesh, Scene, Color } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import font from 'src/assets/fonts/helvetiker_regular.typeface.json'
export class TextCreater {
    private font: Font;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.addFont();
    }


    private addFont() {
        const fontLoader = new FontLoader();
        this.font = fontLoader.parse(font);
    }

    public createText(pos: Vector3, text: string, color: string = '#ffffff', size: number = 0.2, height: number = 0.02) {

        const colorValue = parseInt(color.replace("#", "0x"), 16);
        const colorCode = new Color(colorValue);

        const textGeo = new TextGeometry(text, {
            font: this.font,
            size: size,
            height: height,
        });

        // create the text material
        const textMaterial = new MeshBasicMaterial({ color: colorCode });

        // create the text mesh
        const textMesh = new Mesh(textGeo, textMaterial);

        // set the position of the text
        textMesh.position.set(pos.x - 0.4, pos.y, pos.z);

        // add the text to the scene
        this.scene.add(textMesh)
    }
}
