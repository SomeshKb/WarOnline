import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector3,
  Vector4,
} from "three";
import { qrToWorld } from "./coords";
import Grid from "./Grid";
import { createHexagon } from "./hexagon";
import { isHill, isWater, TileData } from "./interfaces";
import { MapMeshOptions, MapMeshTile } from "./MapMesh";
function isNextOrPrevRiverTile(
  grid: Grid<TileData>,
  tile: TileData,
  q: number,
  r: number,
  coastCount: { count: number }
) {
  const neighbor = grid.get(q, r);

  if (neighbor && neighbor.rivers && tile && tile.rivers) {
    for (let self of tile.rivers) {
      for (let other of neighbor.rivers) {
        const sameRiver =
          self.riverIndex == other.riverIndex &&
          Math.abs(self.riverTileIndex - other.riverTileIndex) == 1;
        const otherRiver = self.riverIndex != other.riverIndex && sameRiver;

        if (sameRiver || otherRiver) {
          return true;
        }
      }
    }

    return false;
  } else {
    // let the river run into the first ocean / lake
    if (neighbor && isWater(neighbor.height) && coastCount.count == 0) {
      coastCount.count++;
      return true;
    } else {
      return false;
    }
  }
}

function computeCoastTextureIndex(
  grid: Grid<TileData>,
  tile: TileData
): number {
  function isWaterTile(q: number, r: number) {
    const t = grid.get(q, r);
    if (!t) return false;
    return isWater(t.height);
  }

  function bit(x: boolean) {
    return x ? "1" : "0";
  }

  if (isWaterTile(tile.q, tile.r)) {
    // only land tiles have a coast
    return 0;
  }

  const NE = bit(isWaterTile(tile.q + 1, tile.r - 1));
  const E = bit(isWaterTile(tile.q + 1, tile.r));
  const SE = bit(isWaterTile(tile.q, tile.r + 1));
  const SW = bit(isWaterTile(tile.q - 1, tile.r + 1));
  const W = bit(isWaterTile(tile.q - 1, tile.r));
  const NW = bit(isWaterTile(tile.q, tile.r - 1));

  return parseInt(NE + E + SE + SW + W + NW, 2);
}

function bitStr(x: boolean): string {
  return x ? "1" : "0";
}

function computeRiverTextureIndex(
  grid: Grid<TileData>,
  tile: TileData
): number {
  if (!tile.rivers) return 0;
  const coastCount = { count: 0 };

  const NE = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q + 1, tile.r - 1, coastCount)
  );
  const E = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q + 1, tile.r, coastCount)
  );
  const SE = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q, tile.r + 1, coastCount)
  );
  const SW = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q - 1, tile.r + 1, coastCount)
  );
  const W = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q - 1, tile.r, coastCount)
  );
  const NW = bitStr(
    isNextOrPrevRiverTile(grid, tile, tile.q, tile.r - 1, coastCount)
  );

  const combination = NE + E + SE + SW + W + NW;

  return parseInt(combination, 2);
}

export function createHexagonTilesGeometry(
  tiles: MapMeshTile[],
  grid: Grid<TileData>,
  numSubdivisions: number,
  options: MapMeshOptions
) {
  const scale = options.scale || 1.0;
  const hexagon = createHexagon(scale, numSubdivisions);
  const geometry = new InstancedBufferGeometry();
  const textureAtlas = options.terrainAtlas;

  geometry.instanceCount = tiles.length;
  geometry.setAttribute("position", (hexagon.attributes as any).position);
  geometry.setAttribute("uv", (hexagon.attributes as any).uv);
  geometry.setAttribute("border", (hexagon.attributes as any).border);

  // positions for each hexagon tile
  const tilePositions: Vector3[] = tiles.map((tile) =>
    qrToWorld(tile.q, tile.r, scale)
  );
  const posAttr = new InstancedBufferAttribute(
    new Float32Array(tilePositions.length * 2),
    2,
    true
  );
  for (let i = 0; i < tilePositions.length; i++) {
    posAttr.setXY(i, tilePositions[i].x, tilePositions[i].y);
  }
  geometry.setAttribute("offset", posAttr);

  //----------------
  const cellSize = textureAtlas.cellSize;
  const cellSpacing = textureAtlas.cellSpacing;
  const numColumns = textureAtlas.width / cellSize;

  function terrainCellIndex(terrain: string): number {
    const cell = textureAtlas.textures[terrain];
    return cell.cellY * numColumns + cell.cellX;
  }

  const styles = tiles.map(function (tile, index) {
    const cell = textureAtlas.textures[tile.terrain];
    if (!cell) {
      throw new Error(
        `Terrain '${tile.terrain}' not in texture atlas\r\n` +
          JSON.stringify(textureAtlas)
      );
    }

    const cellIndex = terrainCellIndex(tile.terrain);
    const shadow = tile.fog ? 1 : 0;
    const clouds = tile.clouds ? 1 : 0;
    const hills = isHill(tile.height) ? 1 : 0;
    const style = shadow * 1 + hills * 10 + clouds * 100;

    // Coast and River texture index
    const coastIdx = computeCoastTextureIndex(grid, tile);
    const riverIdx = computeRiverTextureIndex(grid, tile);

    tile.bufferIndex = index;

    return new Vector4(cellIndex, style, coastIdx, riverIdx);
  });
  const styleData = new Float32Array(tilePositions.length * 4);
  for (let i = 0; i < styles.length; i++) {
    styleData[i * 4] = styles[i].x;
    styleData[i * 4 + 1] = styles[i].y;
    styleData[i * 4 + 2] = styles[i].z;
    styleData[i * 4 + 3] = styles[i].w;
  }
  const styleAttr = new InstancedBufferAttribute(styleData, 4, true);
  geometry.setAttribute("style", styleAttr);

  // surrounding tile terrain represented as two consecutive Vector3s
  // 1. [tileIndex + 0] = NE, [tileIndex + 1] = E, [tileIndex + 2] = SE
  // 2. [tileIndex + 0] = SW, [tileIndex + 1] = W, [tileIndex + 2] = NW
  const neighborsEast = new InstancedBufferAttribute(
    new Float32Array(tiles.length * 3),
    3,
    true
  );
  const neighborsWest = new InstancedBufferAttribute(
    new Float32Array(tiles.length * 3),
    3,
    true
  );

  for (let i = 0; i < tiles.length; i++) {
    const neighbors = grid.surrounding(tiles[i].q, tiles[i].r);

    for (let j = 0; j < neighbors.length; j++) {
      const neighbor = neighbors[j];
      const attr = j > 2 ? neighborsWest : neighborsEast;
      const array = attr.array as number[];

      // terrain cell index indicates the type of terrain for lookup in the shader
      array[3 * i + (j % 3)] = neighbor
        ? terrainCellIndex(neighbor.terrain)
        : -1;
    }
  }

  geometry.setAttribute("neighborsEast", neighborsEast);
  geometry.setAttribute("neighborsWest", neighborsWest);

  return geometry;
}
