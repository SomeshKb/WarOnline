import { Continent } from '../models/continents';
import Grid from './Grid';
import { Height, TileData, QR } from './interfaces';
import { africaMapData, AustraliaMapData, southAmerica } from './mapData';

class Utility {
  static isLand(height: Height) {
    return height >= 0.0 && height < 0.75;
  }

  static isWater(height: Height) {
    return height < 0.0;
  }

  static isHill(height: Height) {
    return height >= 0.375 && height < 0.75;
  }

  static isMountain(height: Height) {
    return height >= 0.75;
  }

  static treeAt(terrain: string): number | undefined {
    if (terrain == 'snow') return 2;
    else if (terrain == 'tundra') return 1;
    else return 0;
  }

  static shuffle<T>(a: T[]): T[] {
    var j: number, x: T, i: number;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
    return a;
  }

  static varying<T>(...values: T[]): T {
    return values[Math.round(Math.random() * (values.length - 1))];
  }

  static isAccessibleMountain(tile: TileData, grid: Grid<TileData>) {
    let ns = grid.neighbors(tile.q, tile.r);
    let spring = Utility.isMountain(tile.height);
    return spring && ns.filter((t) => Utility.isLand(t.height)).length > 3;
  }
}

function generateRivers(grid: Grid<TileData>): Grid<TileData> {
  // find a few river spawn points, preferably in mountains
  const tiles = grid.toArray();
  const numRivers = Math.max(1, Math.round(Math.sqrt(grid.length) / 4));
  const spawns: TileData[] = Utility.shuffle(
    tiles.filter((t) => Utility.isAccessibleMountain(t, grid))
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

    while (!Utility.isWater(tile.height) && river.length < 20) {
      const neighbors = sortByHeight(grid.neighbors(tile.q, tile.r)).filter(
        (t) => !contains(t, river)
      );
      if (neighbors.length == 0) {
        console.info('Aborted river generation', river, tile);
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
  tile: (q: number, r: number) => TileData
): Promise<Grid<TileData>> {
  return generateMap(size, (q, r) => tile(q, r));
}

class TileGenerator {
  coords: QR;
  mapDataHash: Record<string, string> = {};

  constructor(coords: QR, continent: Continent) {
    this.coords = coords;
    const tileDataInfo = this.getContinentName(continent)
    tileDataInfo.forEach((tile) => {
      this.mapDataHash[`${tile.x}:${tile.y}`] = tile.terrain;
    });
  }

  getContinentName(continent: Continent) {
    switch (continent) {
      case Continent.Africa:
        return africaMapData;
      case Continent.Asia:
        return [];
      case Continent.Europe:
        return [];
      case Continent.NorthAmerica:
        return [];
      case Continent.Australia:
        return AustraliaMapData;
      case Continent.SouthAmerica:
        return southAmerica;
      default:
        return [];
    }
  }


  terrainAt(): string {
    const key = `${this.coords.q}:${this.coords.r}`;
    return this.mapDataHash[key] || 'ocean';
  }

  generateTileData(): TileData {
    const terrain = this.terrainAt();
    let height = 0;
    if (terrain == 'mountain') {
      height = 5;
    }

    const trees = 0;

    return {
      q: this.coords.q,
      r: this.coords.r,
      height,
      terrain,
      treeIndex: trees,
      //@ts-ignore
      rivers: null,
      fog: false,
      clouds: false,
    };
  }
}

export class MapGenerator {
  private mapSize: number;
  constructor(mapSize: number) {
    this.mapSize = mapSize;
    // seed(Date.now() + Math.random());
  }
  generate(continent: Continent) {
    const size = this.mapSize;
    const grid = new Grid<TileData>(size, size).mapQR((q, r) => {
      const coords = { q, r };
      const tileGenerator = new TileGenerator(coords, continent);
      return tileGenerator.generateTileData();
    });
    // const withRivers = generateRivers(grid);
    //@ts-ignore
    return grid;
  }
}
