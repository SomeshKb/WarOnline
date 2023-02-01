export enum AdjacentDistict {
  topLeft = 'TL',
  top = 'T',
  topRight = 'TR',
  bottomLeft = 'BL',
  bottom = 'B',
  bottomRight = 'BR',
}

export function calculateNextDistict(
  adjacentDistict: AdjacentDistict,
  currentDistict: Postion
) {
  let x: number = Number(currentDistict.x);
  let y: number = Number(currentDistict.y);

  if (adjacentDistict == AdjacentDistict.top) {
    y = y - 1;
    return { x, y };
  }
  if (adjacentDistict == AdjacentDistict.bottom) {
    y = y + 1;
    return { x, y };
  }

  if (adjacentDistict == AdjacentDistict.topRight) {
    x = x + 1;
    return { x, y };
  }

  if (adjacentDistict == AdjacentDistict.topLeft) {
    x = x - 1;
    return { x, y };
  }
  if (adjacentDistict == AdjacentDistict.bottomLeft) {
    x = x - 1;
    y = y + 1;
    return { x, y };
  }
  if (adjacentDistict == AdjacentDistict.bottomRight) {
    y = y + 1;
    x = x + 1;
    return { x, y };
  }
  return { x, y };
}

export interface Postion {
  x: number;
  y: number;
}
