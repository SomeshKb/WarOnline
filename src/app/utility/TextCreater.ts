import { Vector3, MeshBasicMaterial, Mesh, Scene } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

export class TextCreater {
    private font: Font;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.addFont();
    }

    private async addFont() {
        this.font = await this.loadFont('assets/fonts/helvetiker_bold.typeface.json') as Font;
    }

    private async loadFont(url) {
        return new Promise((resolve, reject) => {
            const fontLoader = new FontLoader();
            fontLoader.load(url, function (font) {
                resolve(font);
            }, undefined, function (error) {
                reject(error);
            });
        });
    }

    public async createText(pos: Vector3, text : string, color: string) {
        var textGeo = new TextGeometry(text, {
            font: this.font,
            size: 0.4,
            height: 0.1,
        });

        // create the text material
        var textMaterial = new MeshBasicMaterial({ color: color });

        // create the text mesh
        var textMesh = new Mesh(textGeo, textMaterial);

        // set the position of the text
        textMesh.position.set(pos.x, pos.y, pos.z);

        // add the text to the scene
        this.scene.add(textMesh)
    }
}
