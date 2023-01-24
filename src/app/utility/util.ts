import { FileLoader, TextureLoader, Texture } from 'three';
import { QR } from './interfaces';

const fileLoader = new FileLoader();
const textureLoader = new TextureLoader();

export function loadTexture(
  url: string,
  onProgress?: (
    percent: number,
    totalBytes: number,
    loadedBytes: number
  ) => void
): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const onLoad = (texture: Texture) => {
      resolve(texture);
    };

    const onProgressWrapper = (progress: { total: number; loaded: number }) => {
      if (onProgress) {
        onProgress(
          100 * (progress.loaded / progress.total),
          progress.total,
          progress.loaded
        );
      }
    };

    const onError = (error: Error) => {
      reject(error);
    };

    (textureLoader.load as any)(url, onLoad, onProgressWrapper, onError);
  });
}

export function loadFile(path: string): Promise<string> {
  // TODO: Remove cache buster
  const url = path; // + "?cachebuster=" + Math.random() * 9999999
  return new Promise((resolve, reject) => {
    fileLoader.load(
      url,
      (result: any) => {
        resolve(result);
      },
      undefined,
      (error: any) => {
        reject(error);
      }
    );
  });
}

export async function loadJSON<T>(path: string): Promise<T> {
  return loadFile(path).then((str) => JSON.parse(str) as T);
}

export function qrRange(qrRadius: number): QR[] {
  const coords: QR[] = [];

  forEachRange(-qrRadius, qrRadius + 1, (dx) => {
    forEachRange(
      Math.max(-qrRadius, -dx - qrRadius),
      Math.min(qrRadius, -dx + qrRadius) + 1,
      (dy) => {
        var dz = -dx - dy;
        coords.push({ q: dx, r: dz });
      }
    );
  });

  return coords;
}

export function forEachRange(min: number, max: number, f: (n: number) => void) {
  if (!max) {
    return range(0, min);
  } else {
    for (var i = min; i < max; i++) {
      f(i);
    }
  }
}

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

export function range(minOrMax: number, max?: number): number[] {
  if (!max) {
    return range(0, minOrMax);
  } else {
    var values: number[] = [];
    for (var i = minOrMax; i < max; i++) {
      values.push(i);
    }
    return values;
  }
}

export function flatMap<T, R>(
  items: T[],
  map: (item: T, index?: number) => R[]
): R[] {
  //@ts-ignore
  return [].concat.apply([], items.map(map));
}

export function sum(numbers: number[]): number {
  return numbers.reduce((sum, item) => sum + item, 0);
}

export function qrEquals(a: QR, b: QR): boolean {
  return a.q == b.q && a.r == b.r;
}

export function minBy<T>(items: T[], by: (item: T) => number): T | null {
  if (items.length == 0) {
    return null;
  } else if (items.length == 1) {
    return items[0];
  } else {
    return items.reduce(
      (min: T, cur: T) => (by(cur) < by(min) ? cur : min),
      items[0]
    );
  }
}

export function isInteger(value: number): boolean {
  return Math.floor(value) == value;
}

export function flatten<T>(items: T[][]): T[] {
  //@ts-ignore
  return [].concat.apply([], items);
}

export const KEY_CODES = {
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  SHIFT: 16,
  Q: 81,
  E: 69,
  G: 71,
};

export interface KeyActions {
  [keyCode: number]: KeyAction;
}

export interface KeyAction {
  down?: () => void; // function to call when key is pressed
  up?: () => void; // function to call when key is released
}

export function paramString(name: string, defaultValue: string): string {
  const queryMatch = document.location.href.match(
    new RegExp(name + '=([^&]+)')
  );
  if (queryMatch) {
    return queryMatch[1];
  } else {
    return defaultValue;
  }
}

export function paramInt(name: string, defaultValue: number): number {
  return parseInt(paramString(name, defaultValue + ''));
}

export function paramFloat(name: string, defaultValue: number): number {
  return parseFloat(paramString(name, defaultValue + ''));
}

export function varying<T>(...values: T[]): T {
  return values[Math.round(Math.random() * (values.length - 1))];
}
