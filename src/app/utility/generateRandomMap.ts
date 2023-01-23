import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector3,
  Vector4,
} from "three";
import { qrToWorld } from "./coords";
import Grid from "./Grid";
import { createHexagon } from "./hexagon";
import { Height, TileData } from "./interfaces";
import { mapdata } from "./mapData";
import { MapMeshOptions, MapMeshTile } from "./MapMesh";
import { perlin2, seed, simplex2 } from "./perlin";

export function shuffle<T>(a: T[]): T[] {
  var j: number, x: T, i: number;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}

export function varying<T>(...values: T[]): T {
  return values[Math.round(Math.random() * (values.length - 1))];
}

export function isLand(height: Height) {
  return height >= 0.0 && height < 0.75;
}

export function isWater(height: Height) {
  return height < 0.0;
}

export function isHill(height: Height) {
  return height >= 0.375 && height < 0.75;
}

export function isMountain(height: Height) {
  return height >= 0.75;
}

function isAccessibleMountain(tile: TileData, grid: Grid<TileData>) {
  let ns = grid.neighbors(tile.q, tile.r);
  let spring = isMountain(tile.height);
  return spring && ns.filter((t) => isLand(t.height)).length > 3;
}

function generateRivers(grid: Grid<TileData>): Grid<TileData> {
  // find a few river spawn points, preferably in mountains
  const tiles = grid.toArray();
  const numRivers = Math.max(1, Math.round(Math.sqrt(grid.length) / 4));
  const spawns: TileData[] = shuffle(
    tiles.filter((t) => isAccessibleMountain(t, grid))
  ).slice(0, numRivers);

  // grow the river towards the water by following the height gradient
  const rivers = spawns.map(growRiver);

  // assign sequential indices to rivers and their tiles
  rivers.forEach((river, riverIndex) => {
    river.forEach((tile, riverTileIndex) => {
      if (riverTileIndex < river.length - 1) {
        tile.rivers = [{ riverIndex, riverTileIndex }];
      }
    });
  });

  return grid;

  function growRiver(spawn: TileData): TileData[] {
    const river = [spawn];

    let tile = spawn;

    while (!isWater(tile.height) && river.length < 20) {
      const neighbors = sortByHeight(grid.neighbors(tile.q, tile.r)).filter(
        (t) => !contains(t, river)
      );
      if (neighbors.length == 0) {
        console.info("Aborted river generation", river, tile);
        return river;
      }

      const next =
        neighbors[
        Math.max(neighbors.length - 1, Math.floor(Math.random() * 1.2))
        ];
      river.push(next);

      tile = next;
    }

    return river;
  }

  function sortByHeight(tiles: TileData[]): TileData[] {
    return tiles.sort((a, b) => b.height - a.height);
  }

  function contains(t: TileData, ts: TileData[]) {
    for (let other of ts) {
      if (other.q == t.q && other.r == t.r) {
        return true;
      }
    }
    return false;
  }
}

function generateMap(
  size: number,
  tile: (q: number, r: number) => TileData
): Promise<Grid<TileData>> {
  const grid = new Grid<TileData>(size, size).mapQR((q, r) => tile(q, r));
  // const withRivers = generateRivers(grid);
  //@ts-ignore
  return grid;
}

function generateRandomMap(
  size: number,
  tile: (q: number, r: number, height: Height) => TileData
): Promise<Grid<TileData>> {
  seed(Date.now() + Math.random());
  return generateMap(size, (q, r) => tile(q, r, 0));
}

export async function generateMapView(mapSize: number) {

  function terrainAt(q: number, r: number): string {
    const index = mapdata.findIndex(x=> x.x==q && x.y==r );
    if(index!=-1){
      return mapdata[index].terrain
    }
    return "ocean";
}

  function treeAt(q: number, r: number, terrain: string): number | undefined {
    if (terrain == "snow") return 2;
    else if (terrain == "tundra") return 1;
    else return 0;
  }

  return generateRandomMap(mapSize, (q, r, height): TileData => {

    const terrain = terrainAt(q, r);

    if(terrain=="mountain"){
      height = 1.7;
    }

    const trees =
      isMountain(height) || isWater(height) || terrain == "desert"
        ? undefined
        : varying(true, false, false)
          ? treeAt(q, r, terrain)
          : undefined;

    return {
      q,
      r,
      height,
      terrain,
      treeIndex: trees,
      //@ts-ignore
      rivers: null,
      fog: false,
      clouds: false,
    };
  });
}
