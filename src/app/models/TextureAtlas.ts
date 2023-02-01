export interface TextureAtlas {
  textures: {
    [name: string]: Cell;
  };
  image: string;
  width: number;
  height: number;
  cellSize: number;
  cellSpacing: number;
}

export interface Cell {
  cellX: number;
  cellY: number;
}
